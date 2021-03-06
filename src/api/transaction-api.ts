import axios from 'axios'
import { TransactionPath } from './constants-api'

export enum transactionType {
  send = 'SEND',
}

export enum transactionMode {
  neft = 'NEFT',
  imps = 'IMPS',
}

export enum splitTransactionStatus {
  insufficientBalance = -1,
  didNotTry = 0,
  hold = 1,
  commit = 2,
  holdDeclined = 3,
  commitDeclined = 4,
  initiated = 5,
  processing = 6,
  success = 7,
  failure = 8,
  refundPending = 9,
  refundSuccess = 10,
  cancelPending = 11,
  cancelled = 12,
}

export enum transactionActionEnum {
  error = -2,
  updating = -1,
  notAvailable = 0,
  available = 1,
  approve = 2,
  reject = 3,
}

export enum nodalStatusEnum {
  internalError = -2,
  noop = -1,
  notInitiated = 0,
  initiated = 1,
  authorized = 2,
  failed = 3,
  credited = 4,
  dispute = 5,
  routed = 6,
  settled = 7,
}

export interface ISplitTransaction {
  id: string
  cancellationId: string
  amount: number
  status: splitTransactionStatus
  createdTimestamp: string
  updatedTimestamp: string
}

export interface INodal {
  id: string
  status: nodalStatusEnum
}

export enum settlementStatusEnum {
  notTriedYet = 0,
  ready = 1,
  started = 2,
  success = 3,
}

export enum refundStatusEnum {
  notTriedYet = 0,
  ready = 1,
  routed = 2,
  success = 3,
}

export interface ISettlement {
  id: string
  amount: number
  status: settlementStatusEnum
  referenceId: string
  createdTimestamp: string
  updatedTimestamp: string | undefined
}

export interface IRefund {
  id: string
  amount: number
  status: refundStatusEnum
  createdTimestamp: string
}

export interface ISettlementContainer {
  eko?: ISettlement
  zms?: ISettlement
}

export interface ITransaction {
  actionStatus: transactionActionEnum
  id: string
  type: transactionType
  mode: transactionMode
  amount: number
  commission: number
  customer: {
    name: string
    phone: string
  }
  beneficiary: {
    name: string
    phone: string
  }
  createdTimestamp: string
  updatedTimestamp: string
  transactionDetails?: ISplitTransaction[]
  nodal: INodal
  settlement: ISettlementContainer | undefined
  refund: IRefund | undefined
}

const getAllTransactionsFormData = (limit: number, offset: number) => {
  const data = new FormData()
  data.append('limit', `${limit}`)
  data.append('offset', `${offset}`)
  return data
}

const getNodalId = (_: any) => _.razorpay_payment_id.String

const getSettlementData = (_: any) => {
  if (!_.settlement.eko.transfer_id && !_.settlement.zms.transfer_id) {
    return undefined
  }
  return {
    createdTimestamp: _.settlement.created_at,
    eko: getSettlementInfo(_.settlement.eko),
    updatedTimestamp: _.settlement.updated_at,
    zms: getSettlementInfo(_.settlement.zms),
  }
}

export const getAllTransactionsAPI = (
  limit: number = 1000,
  offset: number = 0,
): Promise<ITransaction> => {
  return axios
    .post(TransactionPath.all, getAllTransactionsFormData(limit, offset))
    .then(res => {
      return res.data.data.map((_: any): ITransaction => ({
        actionStatus: _.action_status,
        amount: _.amount,
        beneficiary: {
          name: _.beneficiary_name,
          phone: _.beneficiary_phone,
        },
        commission: _.commission,
        createdTimestamp: _.created_at,
        customer: {
          name: _.customer_name,
          phone: _.customer_phone,
        },
        id: _.transaction_id,
        mode: _.transaction_mode,
        nodal: {
          id: getNodalId(_),
          status: getNodalStatus(_, _.action_status),
        },
        refund: getRefundData(_),
        settlement: getSettlementData(_),
        transactionDetails: _.eko_transactions.map(
          ($: any): ISplitTransaction => ({
            amount: $.amount,
            cancellationId: $.eko_refund_tid.String,
            createdTimestamp: $.created_at,
            id: $.eko_tid.String,
            status: getSplitTransactionStatus($),
            updatedTimestamp: $.updated_at,
          }),
        ),
        type: _.transaction_type,
        updatedTimestamp: _.updated_at,
      }))
    })
    .catch(() => [])
}

const getSettlementInfo = (settlement: any): ISettlement | undefined => {
  if (!settlement.transfer_id) {
    return undefined
  }
  return {
    amount: settlement.amount,
    createdTimestamp: settlement.created_at,
    id: settlement.transfer_id,
    referenceId: settlement.utr,
    status: settlement.status,
    updatedTimestamp:
      settlement.updated_at === '0001-01-01T00:00:00Z'
        ? undefined
        : settlement.updated_at,
  }
}
const getRefundData = (_: any): IRefund | undefined => {
  if (!_.settlement.refund.refund_id) {
    return undefined
  }
  return {
    amount: _.settlement.refund.amount_refunded,
    createdTimestamp: _.settlement.refund.created_at,
    id: _.settlement.refund.refund_id,
    status: _.settlement.refund.status,
  }
}

/**
 * Required to handle cancelled and cancelPending status depending on if refund ID is available
 */
const getSplitTransactionStatus = (
  ekoTransaction: any,
): splitTransactionStatus => {
  const ekoStatusCode = ekoTransaction.status_code
  if (
    ekoStatusCode === splitTransactionStatus.cancelPending &&
    ekoTransaction.eko_refund_tid.String
  ) {
    return splitTransactionStatus.cancelled
  }
  return ekoStatusCode
}

const getNodalStatus = (_: any, actionStatus: transactionActionEnum) => {
  if (_.razorpay_payment_status.Valid) {
    return _.razorpay_payment_status.Int64 as nodalStatusEnum
  }
  if (
    !_.razorpay_payment_status.Valid &&
    actionStatus === transactionActionEnum.approve
  ) {
    return nodalStatusEnum.internalError
  }
  return nodalStatusEnum.noop
}

const transactionActionFormData = (
  transactionId: string,
  action: transactionActionEnum,
): FormData => {
  const data = new FormData()
  data.append('transaction', transactionId)
  data.append('status', action.valueOf().toString())
  return data
}

export const transactionActionAPI = (
  transactionId: string,
  action: transactionActionEnum,
) =>
  axios
    .post(
      TransactionPath.updateAction,
      transactionActionFormData(transactionId, action),
    )
    .then(() => true)
    .catch(() => false)
