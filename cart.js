const { createApp, onMounted, ref, reactive } = Vue
// 載入modal模組
import userProductModal from './components/modal.js'

// 表單驗證規則全部載進來
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule])
  }
})
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json')

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
})
const app = createApp({
  components: {
    userProductModal,
  },
  setup() {
    // 網址路徑
    const path = 'vue-winter'
    const url = 'https://vue3-course-api.hexschool.io/v2'
    // 取得的產品資料儲存變數
    const products = reactive({ data: [] })
    // 取得購物車資料變數
    const cart = reactive({ carts: [] })
    // 產品id變數 打開modal
    const productId = ref('')
    // 關閉modal變數
    const closeStatus = ref(false)
    // 取得變更商品數量變數
    const productQty = ref(null)
    // loading變數
    const isLoading = ref(false)
    // loading顏色
    const loadingColor = ref('blue')
    // 收件者資料
    const user = reactive({})
    // 收件者訊息
    const message = ref('')

    // ----------------------------------------
    // 打開modal
    const openModal = (id) => {
      productId.value = id
    }
    // 改變modal變數 避免modal打不開
    const modalStatus = () => {
      productId.value = ''
    }

    // loading的另一種寫法
    const $loading = VueLoading.useLoading({
      color: 'red',
    })

    // 電話驗證規則
    const isPhone = (value) => {
      const phoneNumber = /^(09)[0-9]{8}$/
      return phoneNumber.test(value) ? true : '需要正確的電話號碼'
    }

    // 建立訂單按鈕
    const onSubmit = () => {
      const data = {
        user: user,
        message: message.value,
      }
      const loader = $loading.show({})

      axios
        .post(`${url}/api/${path}/order`, { data })
        .then((res) => {
          loader.hide()
          getCart()
          user.email = ''
          user.name = ''
          user.tel = ''
          user.address = ''
          message.value = ''
          alert('訂單建立成功')
        })
        .catch((err) => {
          loader.hide()
          alert(err)
        })
    }

    // --------------------------------------------
    // 取得產品資料
    const getProducts = () => {
      axios.get(`${url}/api/${path}/products/all`).then((res) => {
        products.data = res.data.products
      })
    }
    // 加入購物車
    const addToCart = (product_id, qty = 1) => {
      const data = {
        product_id,
        qty,
      }
      isLoading.value = true
      // modal關閉變數
      closeStatus.value = true
      axios
        .post(`${url}/api/${path}/cart`, { data })
        .then((res) => {
          productId.value = ''
          getCart()
          isLoading.value = false
          closeStatus.value = false
        })
        .catch((err) => {
          loader.hide()
          alert(err)
        })
    }
    // 取得購物車
    const getCart = () => {
      axios.get(`${url}/api/${path}/cart`).then((res) => {
        cart.carts = res.data.data
      })
    }
    // 修改購物車項目
    const updateCart = (cart_id, product_id, qty) => {
      const data = {
        product_id,
        qty,
      }
      const loader = $loading.show({})
      axios
        .put(`${url}/api/${path}/cart/${cart_id}`, { data })
        .then((res) => {
          loader.hide()
          getCart()
          alert('已修改購物車商品數量')
        })
        .catch((err) => {
          loader.hide()
          alert(err)
        })
    }
    // 刪除單一購物車 / 全部購物車
    const delCart = (cart_id = '') => {
      const loader = $loading.show({})
      if (cart_id === '') {
        axios
          .delete(`${url}/api/${path}/carts`)
          .then((res) => {
            loader.hide()
            getCart()
            alert('已刪除全部購物車')
          })
          .catch((err) => {
            loader.hide()
            alert(err)
          })
      } else {
        axios
          .delete(`${url}/api/${path}/cart/${cart_id}`)
          .then((res) => {
            loader.hide()
            getCart()
            alert('已刪除所選購物車')
          })
          .catch((err) => {
            loader.hide()
            alert(err)
          })
      }
    }

    onMounted(() => {
      getProducts()
      getCart()
    })

    return {
      // 變數
      products,
      productId,
      closeStatus,
      cart,
      productQty,
      isLoading,
      modalStatus,
      onSubmit,
      user,
      message,
      loadingColor,

      // 方法
      openModal,
      addToCart,
      updateCart,
      delCart,
      isPhone,
    }
  },
})
// loading套件註冊
app.use(VueLoading.LoadingPlugin)
app.component('loading', VueLoading.Component)
// 表單驗證註冊
app.use(VeeValidate)
app.component('VForm', VeeValidate.Form)
app.component('VField', VeeValidate.Field)
app.component('ErrorMessage', VeeValidate.ErrorMessage)

app.mount('#app')
