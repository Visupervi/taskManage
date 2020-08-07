import {ExamList} from './examList';
const examListRouter =
  [
    {
      path: '/examList/:courseId',
      componentName: ExamList,
      exact: true,
      // component: () => import(/* webpackChunkName: "medal" */ './login.jsx'),
      meta: {
        title: "考试",
        keepalive: true
      }
    },
  ];
export default examListRouter;

