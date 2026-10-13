<script>
import { defineComponent, h } from 'vue';
import { ElTableColumn, ElTag } from 'element-plus';

const QaTableColumn = defineComponent({
  name: 'QaTableColumn',
  props: {
    column: { type: Object, required: true },
    emptyText: { type: String, default: '--' }
  },
  setup(props, { slots }) {
    function renderLeafChildren(col) {
      if (col.formatter && typeof col.formatter === 'function') {
        return { default: ({ row }) => col.formatter(row) };
      }
      if (col.slotName && slots[col.slotName]) {
        return { default: (slotProps) => slots[col.slotName](slotProps) };
      }
      if (col.tag) {
        return {
          default: ({ row }) => h(ElTag, { type: 'primary', effect: 'dark' }, () => row[col.prop])
        };
      }
      return {
        default: ({ row }) => {
          const val = row[col.prop];
          return val === undefined || val === null || val === '' ? props.emptyText : val;
        }
      };
    }

    return () => {
      const col = props.column;

      if (col.columns?.length) {
        return h(ElTableColumn, col, {
          default: () =>
            col.columns.map((child, idx) =>
              h(
                QaTableColumn,
                {
                  key: child.prop || child.slotName || idx,
                  column: child,
                  emptyText: props.emptyText
                },
                slots
              )
            )
        });
      }

      // type 列（selection/expand/index）由 ElTableColumn 内部处理，不渲染 children
      if (col.type) {
        return h(ElTableColumn, col);
      }

      return h(ElTableColumn, col, renderLeafChildren(col));
    };
  }
});

export default QaTableColumn;
</script>
