import examPaper from './examPaper';
const examPaperRouter =
  [
    {
      path: '/examPaper/:taskId',
      componentName: examPaper,
      exact: true,
      // component: () => import(/* webpackChunkName: "medal" */ './login.jsx'),
      meta: {
        title: "考试",
        keepalive: true
      }
    },
  ];
export default examPaperRouter;

