import {
  Message,
  MessageBox
} from 'element-ui'
import util from '@/libs/util.js'
import router from '@/router'
import {
  Login,
  Logout
} from '@api/user'
// import { adminRoutes } from '@/router/routes'
// import store from '@/store/index'

export default {
  namespaced: true,
  actions: {
    /**
     * @description 登录
     * @param {Object} param context
     * @param {Object} param username {String} 用户账号
     * @param {Object} param password {String} 密码
     * @param {Object} param route {Object} 登录成功后定向的路由对象 任何 vue-router 支持的格式
     */
    login ({
      dispatch
    }, {
      username = '',
      password = ''
    } = {}) {
      return new Promise((resolve, reject) => {
        // 开始请求登录接口
        Login({
          username,
          password
        })
          .then(async res => {
            // 管理员
            // if (res.role_id === 999) {
            //   // console.log(999)
            //   store.commit('d2admin/page/init', adminRoutes)
            // } else if (res.role_id === 1) {
            //   // store.commit('d2admin/page/init', adminRoutes)
            // }
            // 设置 vuex 用户信息
            util.cookies.set('uuid', res.id)
            // util.cookies.set('token', res.id)
            res.name = res.nickname
            await dispatch('d2admin/user/set', {
              name: res.nickname
            }, {
              root: true
            })
            // 用户登录后从持久化数据加载一系列的设置
            await dispatch('load')
            // 结束
            resolve()
          })
          .catch(err => {
            console.log('err: ', err)
            reject(err)
          })
      })
    },
    /**
     * @description 注销用户并返回登录页面
     * @param {Object} param context
     * @param {Object} param confirm {Boolean} 是否需要确认
     */
    logout ({
      commit,
      dispatch
    }, {
      confirm = false
    } = {}) {
      /**
       * @description 注销
       */
      async function logout () {
        // 删除cookie
        util.cookies.remove('token')
        util.cookies.remove('uuid')
        Logout().then(res => {
          console.log('res: ', res)
        }).catch(err => {
          console.log('err: ', err)
        })
        // 清空 vuex 用户信息
        await dispatch('d2admin/user/set', {}, {
          root: true
        })
        // 跳转路由
        router.push({
          name: 'login'
        })
      }
      // 判断是否需要确认
      if (confirm) {
        commit('d2admin/gray/set', true, {
          root: true
        })
        MessageBox.confirm('注销当前账户吗?  打开的标签页和用户设置将会被保存。', '确认操作', {
          confirmButtonText: '确定注销',
          cancelButtonText: '放弃',
          type: 'warning'
        })
          .then(() => {
            commit('d2admin/gray/set', false, {
              root: true
            })
            logout()
          })
          .catch(() => {
            commit('d2admin/gray/set', false, {
              root: true
            })
            Message({
              message: '放弃注销用户'
            })
          })
      } else {
        logout()
      }
    },

    /**
     * @description 用户登录后从持久化数据加载一系列的设置
     * @param {Object} state vuex state
     */
    load ({
      dispatch
    }) {
      return new Promise(async resolve => {
        // DB -> store 加载账号
        await dispatch('d2admin/user/load', null, {
          root: true
        })
        // DB -> store 加载主题
        await dispatch('d2admin/theme/load', null, {
          root: true
        })
        // DB -> store 加载页面过渡效果设置
        await dispatch('d2admin/transition/load', null, {
          root: true
        })
        // // DB -> store 持久化数据加载上次退出时的多页列表
        // await dispatch('d2admin/page/openedLoad', null, { root: true })
        // // DB -> store 持久化数据加载侧边栏折叠状态
        // await dispatch('d2admin/menu/asideCollapseLoad', null, { root: true })
        // DB -> store 持久化数据加载全局尺寸
        await dispatch('d2admin/size/load', null, {
          root: true
        })
        // end
        resolve()
      })
    }
  }
}
