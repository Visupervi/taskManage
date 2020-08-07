import login from './login';
const LoginRouter =
  [
    {
      path: '/login',
      componentName: login,
      exact: true,
      // component: () => import(/* webpackChunkName: "medal" */ './login.jsx'),
      meta: {
        title: "登录",
        keepalive: true
      }
    },
  ];
export default LoginRouter;

