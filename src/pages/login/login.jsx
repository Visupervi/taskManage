import React, {Component} from "react";
import "./login.less"
import {Layout} from 'antd';
import FormComponent from "../../component/formComponent/FormComponent"

const {Header, Content} = Layout;

/**
 * @Author: visupervi
 * @Date: 2020-07-16 16:10
 * @return:
 * @Description 登陆的路由组件
 */
export default class Login extends Component {
  render() {
    return (
      <div className={"login"}>
        <Layout>
          <Header>React管理系统</Header>
          <Content>
            <FormComponent></FormComponent>
          </Content>
        </Layout>
      </div>

    )
  }
}
