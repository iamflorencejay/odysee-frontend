import { connect } from 'react-redux';
import { doAbandonTxo, doAbandonClaim } from 'redux/actions/claims';
import { doHideModal } from 'redux/actions/app';
import ModalRevokeClaim from './view';

const perform = (dispatch) => ({
  abandonClaim: (claim, cb) => dispatch(doAbandonClaim(claim, cb)),
  abandonTxo: (txo, cb) => dispatch(doAbandonTxo(txo, cb)),
  closeModal: () => dispatch(doHideModal()),
});

export default connect(null, perform)(ModalRevokeClaim);
