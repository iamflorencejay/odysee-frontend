import { connect } from 'react-redux';
import { doDeleteFileAndMaybeGoBack } from 'redux/actions/file';
import { doHideModal } from 'redux/actions/app';
import { doResolveUri } from 'redux/actions/claims';
import { selectTitleForUri, selectClaimForUri, makeSelectIsAbandoningClaimForUri } from 'redux/selectors/claims';
import ModalRemoveFile from './view';

const select = (state, props) => {
  const { uri } = props;

  return {
    claim: selectClaimForUri(state, uri),
    isAbandoning: makeSelectIsAbandoningClaimForUri(uri)(state),
    title: selectTitleForUri(state, uri),
  };
};

const perform = (dispatch, ownProps) => {
  const { uri, doGoBack } = ownProps;

  return {
    closeModal: () => dispatch(doHideModal()),
    deleteFile: () => dispatch(doDeleteFileAndMaybeGoBack(uri, doGoBack)),
    doResolveUri: () => dispatch(doResolveUri(uri)),
  };
};

export default connect(select, perform)(ModalRemoveFile);
