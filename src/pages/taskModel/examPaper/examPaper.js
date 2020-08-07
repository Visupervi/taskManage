import React, {Component} from 'react';
import {observer} from "mobx-react";
import {action} from "mobx";
import "./examPaper.css"
import TaskStore from '../TaskStore';
import appStore from "../../../sys/AppStore";
import MessageInfo from '../../../component/messageInfo/messageInfo'
import {getQueryString} from "../../../utils/getToken";

/*分页考试*/
@observer
class ExamPaper extends Component {
  constructor(props) {
    super(props)
    let ts = new TaskStore(appStore)
    let detail = ts.taskDetailMap.get(props.match.params.taskId);
    console.log("detail",detail);
    let history = ts.taskDetailMap.get('history')  //true历史试卷还是任务试卷
    let taskResult = {
      examPassScore: detail.examPassScore, //通过分数
      closed: detail.closed, //是否闭卷 封闭考试：0，否；1，是
      showtype: detail.showtype,  //每页显示一条还是显示多条1:单条展示
      hasExam: detail.hasExam, //是否已经进入过考试（封闭考试）1已经考过了
      examType: detail.examType, //试卷类型
      isAnswer: detail.isAnswer, //是否每题必选1是
      examTime: detail.examTime,  //考试时间
      examId: detail.examId,  //考试id
      showAnswer: detail.showAnswer //还有多久显示答案
    }
    this.state = {
      taskStore: ts,
      taskId: props.match.params.taskId,
      isShowRight: history && taskResult.showAnswer === 0,
      pass: ts.taskResult.pass,
      detail,
      taskResult,
      pageIndex: 0,  /*用于每页显示一条时想，记录页数*/
      remainTime: null,  //考试剩余时间
      history,
      activeN: 1,//选择是否查看错题，默认查看全部
      errorQuestions: [],
    }
    /*兼听浏览器返回*/
    if (!history) {
      this.pushHistory();
      this.resetTime(taskResult.examTime * 60 * 1000)
      if (this.state.detail.closed === 1) { //是闭卷考试,不查询答案
        window.addEventListener("popstate", function (e) {  //回调函数中实现需要的功能
          ts.infoData = {
            content: '提示: 本次考试不允许中途退出！',
            btnTitle1: '暂不退出',
            btnTitle2: '确认提交',
            no: 'cancel',
            yes: 'sumbit'
          }
          //self.pushHistory()
        }, false);
      } else {
        window.addEventListener("popstate", function (e) {  //回调函数中实现需要的功能
          ts.infoData = {
            content: '提示: 是否确认退出！',
            btnTitle1: '暂不退出',
            btnTitle2: '确认退出',
            no: 'cancel',
            yes: 'examList'
          }
          //self.pushHistory()
        }, false);
      }
    }
    if (!this.state.detail.questions || this.state.detail.questions < 1) { //当题目数量为0 时，给提示，返回任务页

      if (this.state.taskStore.taskDetailMap.get('isGrowPath')) {
        // let currentPathData=JSON.parse(sessionStorage.currentPathData)
        // this.props.history.replace(`/pathDetail/${currentPathData.pathId}&&${currentPathData.checkpointId}&&exam`)
        this.props.history.go(-2);
      } else if (this.state.taskStore.taskDetailMap.get('isOnline')) {
        //this.props.history.replace(`/onlineexamlist`)
        this.props.history.go(-2);
      } else {
        //this.props.history.replace('/task')
        if (history) {
          this.props.history.go(-2);
        } else {
          this.props.history.go(-3);
        }

      }
      return
    }
  }

  time = sessionStorage.time; //初始化时间
  componentDidMount() {
    this.chooseErr()
  }

  chooseErr() {
    let tempQues = this.state.detail ? this.state.detail.questions.filter(item => !item.right) : []
    this.setState({errorQuestions: tempQues})
  }

  pushHistory() {
    let state = {
      title: "title",
      url: `__SELF__?accessToken=${getQueryString("accessToken")}`
    };
    window.history.pushState(state, state.title, state.url);
  }

  @action
  single = (item, curDate) => {  //保存选中数据
    if (this.state.history) return
    curDate.answers.map(qs => qs.checked = false)
    item.checked = true;
    item.isRight === '0' ? curDate.right = true : curDate.right = false
    // this.state.detail.questions.forEach((items)=>{
    //     if(items.answerId.indexOf(curDate.answerId)>=0)
    //         items.answers.forEach((item)=>{
    //             if(curDate.answerId===item.answerId){
    //                 item.checked=true;
    //             }else{
    //                 item.checked=false;
    //             }
    //         })
    // })
    this.forceUpdate()
  }

  mul(item, curDate) { //多个选择
    if (this.state.history) return
    item.checked = !item.checked;
    let ErrorNumber = 0
    curDate.answers.map(qs => {
      !((qs.isRight === '0' && qs.checked === true) || (qs.isRight === '1' && qs.checked === false)) && ErrorNumber++
    })
    ErrorNumber === 0 ? curDate.right = true : curDate.right = false
    this.forceUpdate()
  }

  async showError(n) {
    if (n === 1) {

      // if (this.state.taskStore.taskDetailMap.get('isGrowPath')) {
      //   /*let currentPathData=JSON.parse(sessionStorage.currentPathData)
      //   this.props.history.replace(`/pathDetail/${currentPathData.pathId}&&${currentPathData.checkpointId}&&exam`)*/
      //   this.props.history.go(-2);
      // } else if (this.state.taskStore.taskDetailMap.get('isOnline')) {
      //   this.props.history.go(-2);
      // } else {
      //   //this.props.history.replace('/task')
      //   if (this.state.history) {
      //     debugger
      //     console.log("12121");
      //     this.props.history.go(-2);
      //   } else {
      //     this.props.history.go(-3);
      //   }
      // }
      window.location.replace('http://deppon-1258031202.cos.ap-shanghai.myqcloud.com/study/index.html#/study/task?accessToken='+getQueryString("accessToken"));
    }
    if (n === 2) {
      if (this.state.taskStore.taskDetailMap.get('isGrowPath')) {
        if (this.state.detail && this.state.detail.showAnswer > 1) {
          appStore.Snackbar.handleClick('答案保护期，无法查看答案')
          /*setTimeout(()=>{
              let currentPathData=JSON.parse(sessionStorage.currentPathData)
              self.props.history.replace(`/pathDetail/${currentPathData.pathId}&&${currentPathData.checkpointId}&&exam`)
          },3000)*/
          return
        }
        this.chooseErr()
        if (this.state.detail.showAnswer !== 1) {
          this.state.isShowRight = true
        }
        this.state.taskStore.taskResult.showDetail = false;
        this.state.pageIndex = 0;
        let doc = document.querySelector('#examPaper')
        doc.scrollTop = 0
      } else if (this.state.taskStore.taskDetailMap.get('isOnline')) {
        if (this.state.detail && this.state.detail.showAnswer > 1) {
          appStore.Snackbar.handleClick('答案保护期，无法查看答案')
          /* setTimeout(()=>{
               self.props.history.replace(`/onlineexamlist`)
           },3000)*/
          return
        }
        this.state.taskStore.taskResult.showDetail = false;
        this.state.pageIndex = 0;
      } else {
        if (this.state.detail && this.state.detail.showAnswer > 1) {
          appStore.Snackbar.handleClick('答案保护期，无法查看答案')
          /*setTimeout(()=>{self.props.history.replace('/task')},3000)*/
          return
        }
        this.chooseErr()
        this.state.taskStore.taskResult.showDetail = false;
        await this.state.taskStore.getAfterExamTask(this.state.taskId);
        this.state.pageIndex = 0;
        let detail = await this.state.taskStore.taskDetailMap.get(this.state.taskId);
        this.setState({detail: detail});
        if (this.state.detail.showAnswer !== 1) {
          this.state.isShowRight = true
        }
        let doc = document.querySelector('#examPaper')
        doc.scrollTop = 0
      }
      // this.setState({'isShowRight':true});
      this.resetTime(0)
    }
    if (n === 3) {
      window.location.replace('http://deppon-1258031202.cos.ap-shanghai.myqcloud.com/study/index.html#/study/task?accessToken='+getQueryString("accessToken"));

      // if (this.state.taskStore.taskDetailMap.get('isGrowPath')) {
      //   /*let currentPathData=JSON.parse(sessionStorage.currentPathData)
      //   this.props.history.replace(`/pathDetail/${currentPathData.pathId}&&${currentPathData.checkpointId}&&exam`)*/
      //   this.props.history.go(-2);
      // } else if (this.state.taskStore.taskDetailMap.get('isOnline')) {
      //   this.props.history.go(-2);
      // } else {
      //   // debugger;
      //   if (this.state.history === true) {
      //     //this.props.history.replace('/taskTabs')
      //     this.props.history.go(-2);
      //   } else {
      //     //this.props.history.replace('/task')
      //     // TODO 在这里替换德邦URL地址
      //     // window.location = ""
      //     this.props.history.go(-3);
      //   }
      // }
    }
  }

  resetTime(times) {  //使用分钟作为参数
    let self = this;
    var timer = null;
    let setTime = ((new Date()).getTime()) + times
    timer = setInterval(function () {
      let hour = 0,
        minute = 0,
        second = 0;//时间默认值
      let extraTime = Math.floor((setTime - ((new Date()).getTime())) / (1000))
      if (extraTime > 0) {
        hour = Math.floor(extraTime / (60 * 60));
        minute = Math.floor(extraTime / 60) - (hour * 60);
        second = Math.floor(extraTime) - (hour * 60 * 60) - (minute * 60);
      }
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      // console.log(day+"天:"+hour+"小时："+minute+"分钟："+second+"秒");
      self.setState({remainTime: `${hour}:${minute}:${second}`})
      //如果时间耗尽，自动提交考试
      if (self.state.isShowRight || self.state.taskStore.taskResult.pass === 0 || self.state.taskStore.taskResult.pass === 1) {
        clearInterval(timer);
        return false
      }
      if (extraTime <= 0) {
        self.state.taskStore.taskSubmit(true)
        clearInterval(timer);
      }
      /*extraTime--;*/
    }, 1000);
  }

  queslist = (item, index) => {
    return (
      <div className='btn' key={item.questionId}>
        <Topic showtype={this.state.taskResult.showtype} currentData={item} index={index}/>
        <Options currentData={item} single={this.single.bind(this)} mul={this.mul.bind(this)}
                 isShowRight={this.state.isShowRight}/>
        <Analysis currentData={item} isShowRight={this.state.isShowRight}/>
      </div>
    )
  }
  goTo = (n) => {  //跳转
    if (n > 0 && (this.state.pageIndex !== (this.state.detail.questions.length - 1))) {
      this.setState({pageIndex: this.state.pageIndex + n})
    }
    if (n < 0 && this.state.pageIndex !== 0) {
      this.setState({pageIndex: this.state.pageIndex + n})
    }
    this.forceUpdate();
  }
  handleChange = (n) => {
    if (this.state.errorQuestions && this.state.errorQuestions.length === 0) {
      return
    }
    this.setState({activeN: n, pageIndex: 0})
  }

  render() {
    let showtype = this.state.taskResult.showtype;
    // let  questions= this.state.detail.questions;   //默认是每页显示多条
    let questions = this.state.activeN === 1 ? this.state.detail.questions : this.state.errorQuestions;   //默认是每页显示多条
    let currentData = questions && questions[this.state.pageIndex];  //如果是单条类型，每页显示一条
    let showButton = this.state.history ? true : this.state.taskStore.taskResult.hasSumbit
    return (
      <div id='examPaper'>
        <div className={(this.state.history || this.state.isShowRight) ? 'none' : 'remainTime'}>
          <span>剩余时间({this.state.remainTime})</span></div>
        <div className={this.state.isShowRight ? 'tabHeader' : 'none'}>
          <span onClick={this.handleChange.bind(this, 1)}
                className={this.state.activeN === 1 ? 'active' : 'lose'}><b>全部</b></span>
          <span onClick={this.handleChange.bind(this, 2)}
                className={this.state.activeN === 2 ? 'active' : 'lose'}><b>只看错题</b></span>
        </div>
        <div className={(this.state.history || this.state.isShowRight) ? 'paper' : 'bottomMar'}>
          {showtype === '1' ? this.queslist(currentData) : questions.map(this.queslist.bind(this))}
          {showtype === '1' && <hr className='taskExamPaper_hr'/>}
          {showtype === '1' ?
            <Controlbar questions={questions} pageIndex={this.state.pageIndex} goTo={this.goTo}
                        submit={this.state.taskStore.checkSumbit} self={this}
                        history={this.state.history ? true : this.state.taskStore.taskResult.hasSumbit}
                        showError={this.showError.bind(this)}/>
            : <div className={'button'}
                   onClick={showButton ? () => this.showError(3) : this.state.taskStore.checkSumbit}>{showButton ? '结束' : '提交'}</div>

          }
        </div>
        <DisplayResults result={this.state.taskStore.taskResult} showError={this.showError.bind(this)}/>
        <MessageInfo data={this.state.taskStore.infoData} btn={this.state.taskStore.confirm} self={this}/>
      </div>
    )
  }
}

const Topic = (props) => {
  return (
    <div className='singleChoose'>
      <p className='title'>
        {props.showtype !== '1' ? <span>{`${props.index + 1}.`}</span> : null}
        {props.currentData && props.currentData.title}
        <em className={props.currentData && props.currentData.questionType === 0 ? 'single' : 'none'}>单选</em>
        <em className={props.currentData && props.currentData.questionType === 1 ? 'mul' : 'none'}>多选</em>
        <em className={props.currentData && props.currentData.questionType === 2 ? 'choose' : 'none'}>判断</em>
      </p>
      <div
        className={props.currentData && (props.currentData.question_pic || props.currentData.questionPic) ? 'img' : 'none'}>
        <img src={props.currentData && (props.currentData.question_pic || props.currentData.questionPic)} alt="图片"/>
      </div>
    </div>
  );
}
const Options = (props) => {
  if (props.currentData && props.currentData.questionType === 0) {
    return (
      <div className='chooseBdoy singleChooseBody'>
        {props.currentData && props.currentData.answers && props.currentData.answers.map((item, index) => {
          return (
            <div className='item' key={index} onClick={() => props.single(item, props.currentData)}>
              {/*<span className={props.isShowRight?'':'none'}><b className={item.isRight==='0'?'iconfont icon-duihao':'iconfont icon-chahao'}></b></span>*/}
              <em className={item.checked ? 'iconfont icon-xuanzhong' : 'iconfont icon-weixuan'}></em>
              <span className='itemContent'>{item.content}</span>
              <span className={props.isShowRight ? 'showRW' : 'none'}>
                                <img className={item.isRight === '0' ? 'iconfont icon-duihao' : 'none'}
                                     src={'http://supershoper.xxynet.com/vsvz1582294674352'}/>
                            </span>
              <div>
                <img className={(item.anwserPic || item.answerPic) ? 'itemImg' : 'none'}
                     src={item.anwserPic || item.answerPic} alt={' '}/>
              </div>
            </div>
          )
        })}
        {/*<hr className='taskExamPaper_hr' />*/}
      </div>
    );
  } else if (props.currentData && props.currentData.questionType === 1) {
    return (
      <div className='chooseBdoy mulChooseBody'>
        {props.currentData && props.currentData.answers && props.currentData.answers.map((item, index) => {
          return (
            <div className='item' key={index} onClick={() => props.mul(item, props.currentData)}>
              <em className={item.checked ? 'iconfont icon-dianzhong' : 'iconfont icon-fang'}></em>
              <span className='itemContent'>{item.content}</span>
              <span className={props.isShowRight ? 'showRW' : 'none'}>
                                <img className={item.isRight === '0' ? 'iconfont icon-duihao' : 'none'}
                                     src={'http://supershoper.xxynet.com/vsvz1582294674352'}/>
                            </span>
              <div>
                <img className={(item.anwserPic || item.answerPic) ? 'itemImg' : 'none'}
                     src={item.anwserPic || item.answerPic} alt={' '}/>
              </div>
            </div>
          )
        })}
        {/*<hr className='taskExamPaper_hr' />*/}
      </div>
    );
  } else {
    return (
      <div className='chooseBdoy estimateBody'>
        {props.currentData && props.currentData.answers && props.currentData.answers.map((item, index) => {
          return (
            <div className='item' key={index} onClick={() => {
              props.single(item, props.currentData)
            }}>
              {/*<span className={props.isShowRight?'':'none'}><b className={item.isRight==='0'?'iconfont icon-duihao':'iconfont icon-chahao'}></b></span>*/}
              <em className={item.checked ? 'iconfont icon-xuanzhong' : 'iconfont icon-weixuan'}></em>
              <span className='itemContent'>{item.content}</span>
              <span className={props.isShowRight ? 'showRW' : 'none'}>
                                <img className={item.isRight === '0' ? 'iconfont icon-duihao' : 'none'}
                                     src={'http://supershoper.xxynet.com/vsvz1582294674352'}/>
                            </span>
              <div>
                <img className={(item.anwserPic || item.answerPic) ? 'itemImg' : 'none'}
                     src={item.anwserPic || item.answerPic} alt={' '}/>
              </div>
            </div>
          )
        })}
        {/*<hr className='taskExamPaper_hr' />*/}
      </div>
    );
  }
}
const Analysis = (props) => {
  return (
    <div className={props.isShowRight ? 'analysis' : 'none'}>
      <div className={'row'}>
        <div className='title'>回答:</div>
        <em
          className={props.currentData && props.currentData.right ? 'iconfont icon-duihao' : 'iconfont icon-chahao'}></em>
      </div>
      <div className={'row'}>
        <div className='title'>解析:</div>
        <div className='analysisContent'>
          {props.currentData && props.currentData.questionDescription}
        </div>
      </div>
    </div>
  )
}
const Controlbar = (props) => {
  return (
    <div className='controlbar'>
      <span onClick={() => props.goTo(-1)} className={props.pageIndex === 0 ? 'noClick' : 'goBack'}>上一题</span>
      <span className='footBar'><b>{props.pageIndex + 1}</b>/{props.questions && props.questions.length}</span>
      <span onClick={() => props.goTo(1)}
            className={props.pageIndex === (props.questions && props.questions.length - 1) ? 'none' : 'goTo'}>下一题</span>
      <span onClick={() => props.submit(props.self)}
            className={props.pageIndex === (props.questions && props.questions.length - 1) && !props.history ? 'goTo' : 'none'}>提交</span>
      <span onClick={() => props.showError(3)}
            className={props.pageIndex === (props.questions && props.questions.length - 1) && props.history ? 'goTo' : 'none'}>结束</span>
    </div>
  )
}
const DisplayResults = (props) => {
  return (
    <div className={props.result && props.result.showDetail ? 'DisplayResult' : 'none'}>
      <div>
        <div className={props.result && props.result.pass === 1 ? 'showBlock pass' : 'showBlock fail'}>
          <div className='shanchu'>
            <img className='shanchu_img' onClick={() => props.showError(1)}
                 src="http://supershoper.xxynet.com/vsvz1557385401096" alt="X"/>
          </div>
          <div className='empty'></div>
          <div>
            <p className='score'><em>{props.result && (~~props.result.score)}</em><span>得分数/分</span></p>
            <p className='error'><em>{props.result && props.result.error_num}</em><span>错题数/道</span></p>
          </div>
          <div>
            <span onClick={() => props.showError(1)} className='tryOne'><b>以后再说</b></span>
            <span onClick={() => props.showError(2)} className='details'><b>查看明细</b></span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ExamPaper;
