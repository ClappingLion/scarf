import React from 'react';
import loadable from '@loadable/component';
import { Redirect, Route, Switch } from 'react-router-dom';

const LogIn = loadable(() => import('@pages/LogIn'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Main = loadable(() => import('@pages/Main'));

const App = () => (
  <Switch>
    <Route exact path="/">
      <Redirect to="/main" />
    </Route>
    <Route path="/main" component={Main} />
    <Route path="/login" component={LogIn} />
    <Route path="/signup" component={SignUp} />
  </Switch>
);

export default App;
