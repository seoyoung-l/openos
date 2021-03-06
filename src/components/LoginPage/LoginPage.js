import React, {useEffect} from 'react';
import './Sections/LoginPage.css';
import { useForm } from 'react-hook-form';
import SignitureCi from '../_Common/SignitureCi';
import styled from 'styled-components';
import {login} from '../ipcCommunication/ipcCommon';

const electron = window.require("electron")

function Home(props) {
  const { register, errors, handleSubmit } = useForm({ mode: 'onChange' });
  const onSubmit = event => {

    console.log('LOGIN REQUEST:', event);

    login(event.loginId, event.loginPwd).then(function(resData){

      console.log('Promiss login res', resData);

      if (resData.resCode) {
        alert('Login Success! ' + JSON.stringify(resData))
        localStorage.setItem('isLoginElectronApp', true)
        window.location.hash = '#/favorite';
        window.location.reload();
      } else {
        alert('Login fail! Res:' + JSON.stringify(resData))
      }
    }).catch(function(err){
      alert('Login fail! Ex: ' + JSON.stringify(err))
    });
  };


  // electron.ipcRenderer.on('res-login', (event, data) => {
  //   alert('Login Response! ' + JSON.stringify(data))
  //   localStorage.setItem('isLoginElectronApp', true)
  //   window.location.hash = '#/favorite';
  //   window.location.reload();
  // });

  return (
    <div className="sign-in">
      <div className="contents-wrap-login">
        <main className="main-wrap">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="h-sig welcome-title">Sign in</h1>
            <WelcomeWordWide className="sub2 welcome-txt">- 환영합니다! 서비스 사용을 위해 로그인 해주세요 -</WelcomeWordWide>
            <WelcomeWord className="sub2 welcome-txt"> 서비스 사용을 위해 로그인 해주세요 -</WelcomeWord>
            <div className="row">
              <input
                type="text"
                className="user-id-here"
                name="loginId"
                aria-invalid={errors.id ? "true" : "false"}
                placeholder="아이디를 입력해주세요"
                ref={register({
                  required: true
                })}
              />
              {errors.id && <div className="err-msg">아이디는 필수입력항목입니다.</div>}
            </div>
            <div className="row">
              <input
                type="password"
                className="user-pw-here"
                name="loginPwd"
                aria-invalid={errors.password ? "true" : "false"}
                placeholder="비밀번호를 입력해주세요"
                ref={register({
                  required: true,
                  maxLength: 12,
                  minLength: 4
                })}
              />
              {errors.password && <div className="err-msg">비밀번호는 필수입력항목이며 4~12자 입니다.</div>}
            </div>
            <div className="submit-wrap">
              <button type="submit">Let's start </button>
            </div>
            <div className="sign-in-action-wrap">
              <div className="auto-sign-in">
                <input type="checkbox" id="auto-sign-in-check" />
                <label className="sub2" htmlFor="auto-sign-in-check">자동로그인</label>
              </div>
              <div className="go-to-reset-pw">
                <a href="#" className="sub2">비밀번호 재설정</a>
              </div>
            </div>
          </form>
        </main>
        <SignitureCi color />
      </div>
    </div>
  );
}

export default Home;

const WelcomeWordWide = styled.span`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const WelcomeWord = styled.span`
  @media (min-width: 768px) {
    display: none !important;
  }
`;