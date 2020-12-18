import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import 'semantic-ui-css/semantic.css'; 
import {Form,Input} from 'semantic-ui-react-form-validator';
import { Button, Card, Container, Divider, Grid } from 'semantic-ui-react';
import axios from 'axios';
import { Link, Redirect, BrowserRouter } from 'react-router-dom';

const SignInWith = props => {
  return (
    <div
      style={styles.icon}>
      <FontAwesomeIcon
        icon={props.icon}
        size='2x'
      />
    </div>
  )
}

const SignInForm = () => {
  const [login, toggleLogin] = useState(true);
  const [signIn, toggleSignIn] = useState(false);
  const [email, toggleEmail] = useState("");
  const [fullName, togglefullName] = useState("");
  const [userName, toggleuserName] = useState("");
  const [password, togglePassword] = useState("");


  const handleSubmit = () => {
    axios({
      method: 'POST',
      url: 'http://localhost:8080/user/signup',
      data: {
        email: email,
        fullName: fullName,
        username: userName,
        password: password
      }
    })
      .then(r => console.log('POST METHOD DONE !'))
      .catch(err => console.log('ERROR !' + err))
  }

  const handleSignIn = () => {
    axios({
      method: 'POST',
      url: 'http://localhost:8080/user/signin',
      data: {
        username: userName,
        password: password
      }
    })
      .then(() => {
        console.log('POST (Sign in) Done !');
        toggleSignIn(!signIn);
      })
      .catch(err => console.log(err))
  }

  if (signIn) {
    return (
      <Redirect to='/app/code' />
    )
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Card.Header>
          <h2 style={styles.header}>TypeCode</h2>
        </Card.Header>
        <Divider />
        <Form>
          <center>
          {!login && (
            <>
              <Input id='Email' placeholder='Email' type="text" 
                onChange={(e)=>{toggleEmail(e.target.value)}} 
                value={email} 
                validators={['required','isEmail']} 
                errorMessages={['this field is required','invalid email']} 
              />
              <Input id='FullName' placeholder='Full Name' type="text"
                onChange={(e)=>{togglefullName(e.target.value)}} 
                value={fullName} 
                validators={['required']} 
                errorMessages={['this field is required']} 
              />
            </>
          )}
            <Input id='Username' placeholder='Username' type="text" 
              onChange={(e)=>{toggleuserName(e.target.value)}} 
              value={userName} 
              validators={['required','minStringLength:3']} 
              errorMessages={['this field is required','minimum length should be 3']} 
            />
            <Input id='Password' placeholder='Password' type='password'
              onChange={(e)=>{togglePassword(e.target.value)}} 
              value={password} 
              validators={['required','matchRegexp:^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])', 'minStringLength:6']} 
              errorMessages={['this field is required','password should contain 1 lowercase char, 1 uppercase char, 1 special char, 1 number','minimum length should be 6']} 
            />
          {!login ? (
            <Button onClick={handleSubmit} secondary>Sign Up</Button>
          ) : (
              <Button onClick={handleSignIn} secondary>Log In</Button>
            )}
          </center>
        </Form>
      </Card.Content>
      <Divider horizontal>OR</Divider>
      <Card.Content extra>
        <p style={styles.subAuth}>Log in with</p>
        <Grid>
          <Grid.Row style={styles.icons}>
            <SignInWith icon={faGithub} AuthName="Github" />
            <SignInWith icon={faGoogle} AuthName="Google" />
          </Grid.Row>
        </Grid>
      </Card.Content>
      <Card.Content extra>
        {
          login ? (
            <p style={{ color: 'black' }}>
              Don't have an account ?
              <span
                style={styles.link}
                onClick={() => toggleLogin(false)}>{" Sign up"}</span>
            </p>
          ) : (
              <p style={{ color: 'black' }}>
                Have an account ?
                <span
                  style={styles.link}
                  onClick={() => toggleLogin(true)}>{" Log in"}</span>
              </p>
            )
        }
        <a
          style={{ color: '#1f6f8b', cursor: 'pointer', fontSize: '12px' }}>
          Forgot password ?
        </a>
      </Card.Content>
    </Card>
  )
}

const Login = () => {
  return (
    <Container textAlign="center">
      <SignInForm />
    </Container>
  )
}

const styles = {
  link: { color: '#1f6f8b', cursor: 'pointer' },
  icon: {
    color: 'black',
    paddingLeft: '20px',
    cursor: 'pointer'
  },
  icons: {
    marginLeft: '30%',
    marginRight: 'auto'
  },
  header: {
    fontFamily: 'Goldman, cursive',
    color: '#f05459',
    fontSize: '35px',
    paddingBottom: '15px',
    paddingTop: '10px',
    textShadow: '2px 2px black'
  },
  subHeader: {
    color: '#222831',
    fontFamily: 'Goldman, cursive',
    fontSize: '20px'
  },
  subAuth: {
    color: '#222831',
    fontFamily: 'Goldman, cursive',
    fontSize: '15px'
  },
  container: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    background: '#ffff'
  },
  cardLogin: {
    fontFamily: 'Constantine',
    color: 'black'
  }
}
export default Login;