import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import { doToggleShuffleList } from 'redux/actions/content';
import { selectListShuffle } from 'redux/selectors/content';
import * as MODALS from 'constants/modal_types';
import CollectionMenuList from './view';

const select = (state, props) => ({
  shuffleList: selectListShuffle(state),
});

const perform = (dispatch) => ({
  doToggleShuffleList: (collectionId) => dispatch(doToggleShuffleList(undefined, collectionId, true, true)),
  openDeleteModal: (collectionId) => dispatch(doOpenModal(MODALS.COLLECTION_DELETE, { collectionId })),
});

export default connect(select, perform)(CollectionMenuList);
