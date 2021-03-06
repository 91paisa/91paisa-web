import * as React from 'react'
import { Route, Switch } from 'react-router'
import styled from 'styled-components'
import { lightGrey } from '../styles/colors'
import { isPhoneOrTable } from '../styles/screenSize'
import CustomerDetailContainer from './CustomerDetail/CustomerDetailContainer'
import CustomersContainer from './Customers/CustomersContainer'
import Dashboard from './Dashboard/Dashboard'
import LogsNavigation from './Logs/LogsNavigation'
import SettingsContainer from './Settings/SettingsContainer'
import TransactionDetailContainer from './TransactionDetail/TransactionDetailContainer'
import TransactionsListContainer from './Transactions/TranasctionsListContainer'

const Content = () => (
  <OuterContainer>
    <Switch>
      <Route exact={true} path={'/'} component={Dashboard} />
      {isPhoneOrTable() && (
        <Route
          exact={true}
          path={'/customers/:customerPhone'}
          component={CustomerDetailContainer}
        />
      )}
      <Route path={'/customers'} component={CustomersContainer} />
      <Route
        exact={true}
        path={'/transactions'}
        component={TransactionsListContainer}
      />
      <Route
        path={'/transactions/:transactionId'}
        component={TransactionDetailContainer}
      />
      <Route path={'/logs'} component={LogsNavigation} />
      <Route path={'/settings'} component={SettingsContainer} />
      <Route render={() => <div>No Page Found</div>} />
    </Switch>
  </OuterContainer>
)

const OuterContainer = styled.div`
  background: ${lightGrey};
  overflow: hidden;
`

export default Content
