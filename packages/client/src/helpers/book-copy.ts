import { Dialog } from "quasar";
import { ProblemType } from "src/@generated/graphql";
import { useI18nOutsideSetup } from "src/boot/i18n";
import ProblemsDialog from "src/components/manage-users/problems-dialog.vue";
import { notifyError } from "src/helpers/error-messages";
import {
  BookCopyDetailsFragment,
  BookCopyDetailsFragmentDoc,
  ProblemSummaryFragment,
  useReportProblemMutation,
  useResolveProblemMutation,
} from "src/services/book-copy.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation } = useRetailLocationService();

export const hasProblem = ({ problems }: BookCopyDetailsFragment) =>
  problems?.some(({ resolvedAt }) => !resolvedAt);

export const getCurrentActiveProblem = ({
  problems,
}: BookCopyDetailsFragment) => problems?.find(({ resolvedAt }) => !resolvedAt);

export const isAvailable = (bookCopy: BookCopyDetailsFragment) =>
  (["donated", "reimbursed", "available"] as BookCopyStatus[]).includes(
    getStatus(bookCopy),
  ) && !hasProblem(bookCopy);

export type BookCopyStatus =
  | "not-available"
  | "available"
  | "donated"
  | "returned"
  | "sold"
  | "reimbursed"
  | "settled"
  | Exclude<ProblemType, "CUSTOM">;

export function getStatus(bookCopy: BookCopyDetailsFragment): BookCopyStatus {
  const problemType = getCurrentActiveProblem(bookCopy)?.type;

  return bookCopy.returnedAt
    ? "returned"
    : bookCopy.reimbursedAt
      ? "reimbursed"
      : bookCopy.purchasedAt &&
          (!bookCopy.returnedAt ||
            bookCopy.sales?.some(({ refundedAt }) => !refundedAt))
        ? bookCopy.settledAt
          ? "settled"
          : "sold"
        : bookCopy.donatedAt
          ? "donated"
          : problemType
            ? problemType !== "CUSTOM"
              ? problemType
              : "not-available"
            : "available";
}

export const calculateBookCopyPrice = (
  originalPrice: number,
  kind: "sell" | "buy",
  iseeDiscountApplied = false,
) =>
  (originalPrice *
    (kind === "buy" || iseeDiscountApplied
      ? selectedLocation.value.buyRate
      : selectedLocation.value.sellRate)) /
  100;

const { resolveProblem } = useResolveProblemMutation();
const { reportProblem } = useReportProblemMutation();
const { t } = useI18nOutsideSetup();
export const reportOrSolveProblem = (bookCopy: BookCopyDetailsFragment) =>
  new Promise<void>((resolve) => {
    Dialog.create({
      component: ProblemsDialog,
      componentProps: {
        bookCopy,
      },
    }).onOk(async ({ solution, details, type }: ProblemSummaryFragment) => {
      const activeProblem = getCurrentActiveProblem(bookCopy);

      try {
        const { cache, data } = activeProblem
          ? await resolveProblem({
              input: { id: activeProblem.id, solution },
            })
          : await reportProblem({
              input: {
                bookCopyId: bookCopy.id,
                details,
                type,
              },
            });
        cache.updateFragment(
          {
            fragment: BookCopyDetailsFragmentDoc,
            fragmentName: "BookCopyDetails",
            id: cache.identify(bookCopy),
          },
          (book) => {
            if (!book) {
              return;
            }

            return {
              ...book,
              problems: activeProblem
                ? book.problems?.map((problem) =>
                    !problem.resolvedAt ? data : problem,
                  )
                : [...(book.problems ?? []), data],
            };
          },
        );
      } catch (e) {
        const error = e as Error;
        notifyError(
          t(
            activeProblem
              ? "bookErrors.notSolveProblem"
              : "bookErrors.notProblem",
          ),
        );
        console.error(error.message);
      } finally {
        resolve();
      }
    });
  });
