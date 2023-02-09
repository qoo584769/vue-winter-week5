const { watch, onMounted, ref, reactive } = Vue

export default {
  template: '#userProductModal',
  props: ['id', 'closeStatus'],
  setup(props, { emit }) {
    // 網址路徑
    const path = 'vue-winter'
    const url = 'https://vue3-course-api.hexschool.io/v2'
    // modal變數
    const modal = ref(null)
    const bsModal = ref('')
    // 商品變數
    const product = reactive({ data: {} })

    const qty = ref(null)

    // loading
    const $loading = VueLoading.useLoading({
      color: 'red',
    })
    // emit購物車
    const modalAddToCart = () => {
      emit('emitToCart', props.id, parseInt(qty.value.value))
    }

    const closeModal = () => {
      bsModal.value.hide()
      emit('emitCloseModal')
    }

    onMounted(() => {
      bsModal.value = new bootstrap.Modal(modal.value, {
        backdrop: 'static',
      })
    })

    watch(
      () => props.id,
      () => {
        if (props.id === '') {
          return
        }
        const loader = $loading.show({
          // Optional parameters
        })
        axios
          .get(`${url}/api/${path}/product/${props.id}`)
          .then((res) => {
            product.data = res.data.product
            loader.hide()
            bsModal.value.show()
          })
          .catch((err) => {
            alert(err)
          })
      }
    )

    watch(
      () => props.closeStatus,
      () => {
        bsModal.value.hide()
      }
    )

    return {
      modal,
      props,
      product,
      modalAddToCart,
      closeModal,
      qty,
    }
  },
}
