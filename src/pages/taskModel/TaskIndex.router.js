import task from './TaskIndexPage';
const taskRouter =
  [
    {
      path: '/task',
      componentName: task,
      exact: true,
      // component: () => import(/* webpackChunkName: "medal" */ './login.jsx'),
      meta: {
        title: "考试",
        keepalive: true
      }
    },
  ];
export default taskRouter;

