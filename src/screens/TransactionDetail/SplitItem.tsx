import * as React from 'react'
import styled from 'styled-components'
import {
  ISplitTransaction,
  splitTransactionStatus,
} from '../../api/transaction-api'
import { alertPending, positiveGreen } from '../../styles/colors'
import AmountCell from '../Transactions/AmountCell'
import TimeCell from '../Transactions/TimeCell'
import SplitStatus from './SplitStatus'

interface IProps {
  split: ISplitTransaction
}

interface IContainerProps {
  status: splitTransactionStatus
}

const SplitItem: React.SFC<IProps> = props => (
  <Container status={props.split.status}>
    <div style={{ marginRight: '2rem' }}>
      <AmountCell style={{ fontSize: '1.3rem' }} amount={props.split.amount} />
      <br />
      <TimeCell time={props.split.updatedTimestamp} />
    </div>
    <div style={{ textAlign: 'right', display: 'block' }}>
      <p># {props.split.id}</p>
      <SplitStatus status={props.split.status} />
    </div>
  </Container>
)

const Container = styled.div`
  display: flex;
  padding: 1rem;
  margin: 1rem 0 0 1rem;
  border-radius: 0.5rem;
  border-color: ${(props: IContainerProps) =>
    props.status === splitTransactionStatus.success
      ? positiveGreen
      : alertPending};
  border-width: 1px;
  border-style: solid;
  &:hover {
    box-shadow: inset 0 2px 4px hsla(0, 0%, 0%, 0.05);
  }
`

export default SplitItem
