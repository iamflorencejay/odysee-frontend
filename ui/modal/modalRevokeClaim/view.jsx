// @flow
import { FormField } from 'component/common/form';
import { Modal } from 'modal/modal';
import * as txnTypes from 'constants/transaction_types';
import Button from 'component/button';
import Card from 'component/common/card';
import I18nMessage from 'component/i18nMessage';
import LbcSymbol from 'component/common/lbc-symbol';
import React, { useState } from 'react';

type Props = {
  claim: GenericClaim,
  tx: Txo,
  abandonClaim: (GenericClaim, ?() => void) => void,
  abandonTxo: (Txo, () => void) => void,
  cb: () => void,
  closeModal: () => void,
};

export default function ModalRevokeClaim(props: Props) {
  const { claim, tx, abandonClaim, abandonTxo, cb, closeModal } = props;

  const { value_type: valueType, type, normalized_name: name, is_my_input: isSupport } = tx || claim;
  const [channelName, setChannelName] = useState('');

  const shouldConfirmChannel =
    valueType === txnTypes.CHANNEL || type === txnTypes.CHANNEL || (type === txnTypes.UPDATE && name.startsWith('@'));

  const label =
    isSupport && type === txnTypes.SUPPORT
      ? __('Confirm Support Removal')
      : type === txnTypes.SUPPORT
      ? __('Confirm Tip Unlock')
      : type === txnTypes.CHANNEL
      ? __('Confirm Channel Removal')
      : __('Confirm Removal');

  function revokeClaim() {
    tx ? abandonTxo(tx, cb) : abandonClaim(claim, cb);
    closeModal();
  }

  function getMsgBody(type: string, isSupport: boolean, name: string) {
    if (isSupport && type === txnTypes.SUPPORT) {
      return (
        <>
          <p>{__('Are you sure you want to remove this boost?')}</p>
          <p>
            <I18nMessage tokens={{ lbc: <LbcSymbol /> }}>
              These Credits are permanently yours and this boost can be removed at any time. Removing this boost will
              reduce discoverability and return %lbc% to your spendable balance.
            </I18nMessage>
          </p>
        </>
      );
    } else if (type === txnTypes.SUPPORT) {
      return (
        <>
          <p>{__('Are you sure you want to unlock these Credits?')}</p>
          <p>
            {__(
              'These Credits are permanently yours and can be unlocked at any time. Unlocking them allows you to spend them, but reduces discoverability of your content in lookups and search results. It is recommended you leave Credits locked until you need or want to spend them.'
            )}
          </p>
        </>
      );
    } else if (shouldConfirmChannel) {
      return (
        <>
          <p>
            {__('This will permanently remove your channel. Content published under this channel will be orphaned.')}
          </p>
          <p>{__('Are you sure? Type %name% to confirm that you wish to remove the channel.', { name })}</p>
          <FormField type={'text'} onChange={(e) => setChannelName(e.target.value)} />
        </>
      );
    }

    return (
      <>
        <p>{__('Are you sure you want to remove this?')}</p>
        <p>
          <I18nMessage tokens={{ lbc: <LbcSymbol /> }}>
            This will prevent others from resolving and accessing the content you published. It will return the %lbc% to
            your spendable balance.
          </I18nMessage>
        </p>
        <p className="help error__text"> {__('FINAL WARNING: This action is permanent and cannot be undone.')}</p>
      </>
    );
  }

  return (
    <Modal isOpen contentLabel={label} type="card" onAborted={closeModal}>
      <Card
        title={label}
        body={getMsgBody(type, isSupport, name)}
        actions={
          <div className="section__actions">
            <Button
              disabled={shouldConfirmChannel && name !== channelName}
              button="primary"
              label={label}
              onClick={revokeClaim}
            />
            <Button button="link" label={__('Cancel')} onClick={closeModal} />
          </div>
        }
      />
    </Modal>
  );
}
