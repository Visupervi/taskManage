import React from "react"
import {CommonInterface} from "../../utils/CommonInterface";
import {HTTPCnst} from "../../service/httpCnst.js"
import {observer} from "mobx-react";
import './ExamExplain.css'
import TaskStore from '../../service/TaskStore';
import appStore from "../../sys/AppStore"
import {getExamQuestionInfoByExamId, getOneHistoryExamQuestionInfo} from "../../apis/Api";
import {getQueryString} from "../../utils/getToken";

@observer
class ExamExplain extends React.Component {
  constructor(props) {
    super(props)
    CommonInterface.setTitle("考试说明");
    this.state = {
      examData: {},
      examId: props.match.params.examId,
      currentIndex: 0,
      data: {}
    }
  }

  componentWillMount() {
    // let data = this.props.location.query;
    // let {examTime,totalScore,examPassScore,description} = data;

  }

  componentDidMount() {

    this.getPaperData()
    this.setState({
      data: this.state.examData
    })
  }

  async getPaperData() {
    let onlineTab = getQueryString("onlineTab");
    let result;
    if (onlineTab === '1') {
      result = await getOneHistoryExamQuestionInfo({
        accessToken: getQueryString("accessToken"),
        examId: this.state.examId
      })
    } else {
      result = await getExamQuestionInfoByExamId({
        accessToken: getQueryString("accessToken"),
        examId: this.state.examId
      })
    }
    if (result.dataObject && result.dataObject.questions) {
      this.setState({
        data: result.dataObject,
        examData: result.dataObject
      });
      console.log("this.state", this.state.data);
      this.state.examData.questions = result.dataObject.questions;
    }
    this.setState({data: result.dataObject})
  }

  toPaper() {
    let data = this.state.examData;
    //模拟考试任务接口
    let examId = data.examId;
    this.taskStore = new TaskStore(appStore);
    this.taskStore.taskDetailMap.set(examId.toString(), data)
    this.taskStore.taskDetailMap.set('id', examId.toString())
    this.taskStore.taskDetailMap.set('history', getQueryString("onlineTab") === '1' ? true : false)
    //this.taskStore.taskDetailMap.set('history', sessionStorage.onlineTab === '1' ? true : false)  //是否是历史考卷
    this.taskStore.taskDetailMap.set('isOnline', true)  //是成长路径
    //getQueryString("onlineTab")
    if (getQueryString("onlineTab") === '1' && this.props.location && this.props.location.query && this.props.location.query.status === 'completed') {
      appStore.Snackbar.handleClick('正式考试结束后可查看详情!')
      return
    }
    // if (sessionStorage.onlineTab === '1' && this.props.location && this.props.location.query && this.props.location.query.status === 'completed') {
    //   appStore.Snackbar.handleClick('正式考试结束后可查看详情!')
    //   return
    // }
    this.props.history.replace('/onlineExamPaper/' + examId + '?accessToken=' + getQueryString("accessToken"));
  }

  render() {
    let data = this.state.data;
    console.log("data", data);
    let {examTime, totalScore, examPassScore, description} = data;
    //let onlineTab = sessionStorage.onlineTab
    let onlineTab = getQueryString("onlineTab");
    return (
      <div className='ExamExplain'>
        <div className='exam_pic'>
          <img
            src={'https://supershoper.xxynet.com/tmp/wxf0e5b1f6c8ed32bb.o6zAJsy6f5iGvKfJue-sSWm_KoOg.eZo1KhiVeiuE99fe9b4615b13c897002b78797368b69.png'}
            alt='考试封面图片'/>
          {/* <div></div> */}
        </div>
        <p className='exam_totalTime'>本次考试<span>{examTime || 0}分钟</span></p>
        <h6 className='line'></h6>
        <p className='score'>满分<span>{totalScore || 0}</span>/及格<span>{examPassScore || 0}</span></p>
        <p className='describe'><span>{description || ''}</span></p>
        {examTime && <p className='submit'>
          <button onClick={() => this.toPaper()}>{onlineTab === '1' ? '查看详情' : '开始考试'}</button>
        </p>}

      </div>
    )

  }

}

export default ExamExplain;
