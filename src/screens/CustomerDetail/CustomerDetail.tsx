import { Component, default as React } from 'react'
import styled from 'styled-components'
import { ICustomer } from '../../api/customer-api'
import BeneficiariesListContainer from './Beneficiary/BeneficiariesListContainer'
import CustomerCard from './CustomerCard'
import CustomerTransactionContainer from './transaction/CustomerTransactionsContainer'

interface IProps {
  customer: ICustomer | undefined
  customerIndex: number
}

class CustomerDetail extends Component<IProps, {}> {
  public render() {
    const { customer, customerIndex } = this.props
    return (
      <OuterContainer>
        <InnerContainer>
          {customer && (
            <>
              <CustomerCard customer={customer} />
              <BeneficiariesListContainer
                customerPhone={customer.phone}
                customerIndex={customerIndex}
              />
              {customer.lastTransaction && <CustomerTransactionContainer />}
            </>
          )}
        </InnerContainer>
      </OuterContainer>
    )
  }
}

const OuterContainer = styled.div`
  width: 100%;
  overflow: auto;
`

const InnerContainer = styled.div`
  max-width: 88rem;
  margin: 0 auto;
`

export default CustomerDetail
