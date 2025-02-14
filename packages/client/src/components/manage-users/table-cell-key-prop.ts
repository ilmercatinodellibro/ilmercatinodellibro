// QTd system piggybacks on Vue `key` management, which is a "special" prop
// which is added directly on the vnode object and is not subject to attrs inheritance rules
// That's the reason why using `key` as a prop name is forbidden and generates a warning at runtime
// TODO: We should use a prop to provide the column name to QTd (e.g. `name`)
// instead of relying on `key`, manually setting the value of the new prop as `vm.vnode.key` inside the component (if possible),
// instead of reading it from there
// See https://github.com/quasarframework/quasar/issues/17830
// See https://github.com/quasarframework/quasar/blob/26a30d72fea61c15f190c4dc52666f5f38a4d10a/ui/src/components/table/QTd.js#L28

export interface QTdKeyProp {
  keyTd?: string;
}
