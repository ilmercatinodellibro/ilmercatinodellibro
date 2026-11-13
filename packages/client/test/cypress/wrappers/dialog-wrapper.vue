<script lang="ts">
import { Dialog } from "quasar";
import { defineComponent } from "vue";

export default defineComponent({
  name: "DialogWrapper",
  props: {
    component: {
      type: Object,
      required: true,
    },
    componentProps: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    // The dialog is opened once with the props given at mount time
    // eslint-disable-next-line vue/no-setup-props-reactivity-loss
    Dialog.create({
      component: props.component,

      // props forwarded to your custom component
      componentProps: props.componentProps,
    });
  },
});
</script>
