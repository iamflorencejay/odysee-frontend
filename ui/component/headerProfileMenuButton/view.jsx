// @flow
import 'scss/component/_header.scss';

import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import ChannelThumbnail from 'component/channelThumbnail';
import classnames from 'classnames';
import MenuLinkButton from 'component/common/menu-link';
import Icon from 'component/common/icon';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';

type HeaderMenuButtonProps = {
  activeChannelClaim: ?ChannelClaim,
  authenticated: boolean,
  email: ?string,
  signOut: () => void,
};

export default function HeaderProfileMenuButton(props: HeaderMenuButtonProps) {
  const { activeChannelClaim, authenticated, email, signOut } = props;

  const activeChannelUrl = activeChannelClaim && activeChannelClaim.permanent_url;

  return (
    <div className="header__buttons">
      <Menu>
        {activeChannelUrl === undefined ? (
          <Skeleton variant="circular" animation="wave" className="header__navigationItem--iconSkeleton" />
        ) : (
          <MenuButton
            aria-label={__('Your account')}
            title={__('Your account')}
            className={classnames('header__navigationItem', {
              'header__navigationItem--icon': !activeChannelUrl,
              'header__navigationItem--profilePic': activeChannelUrl,
            })}
          >
            {activeChannelUrl ? (
              <ChannelThumbnail uri={activeChannelUrl} small noLazyLoad />
            ) : (
              <Icon size={18} icon={ICONS.ACCOUNT} aria-hidden />
            )}
          </MenuButton>
        )}

        <MenuList className="menu__list--header">
          {authenticated ? (
            <>
              <MenuLinkButton page={PAGES.UPLOADS} icon={ICONS.PUBLISH} label={__('Uploads')} />
              <MenuLinkButton page={PAGES.CHANNELS} icon={ICONS.CHANNEL} label={__('Channels')} />
              <MenuLinkButton page={PAGES.CREATOR_DASHBOARD} icon={ICONS.ANALYTICS} label={__('Creator Analytics')} />
              <MenuLinkButton page={PAGES.REWARDS} icon={ICONS.REWARDS} label={__('Rewards')} />
              <MenuLinkButton page={PAGES.INVITE} icon={ICONS.INVITE} label={__('Invites')} />

              <MenuItem onSelect={signOut}>
                <div className="menu__link">
                  <Icon aria-hidden icon={ICONS.SIGN_OUT} />
                  {__('Sign Out')}
                </div>
                <span className="menu__link-help">{email}</span>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuLinkButton page={PAGES.AUTH_SIGNIN} icon={ICONS.SIGN_IN} label={__('Log In')} />
              <MenuLinkButton page={PAGES.AUTH} icon={ICONS.SIGN_UP} label={__('Sign Up')} />
              <MenuLinkButton page={PAGES.SETTINGS} icon={ICONS.SETTINGS} label={__('Settings')} />
              <MenuLinkButton page={PAGES.HELP} icon={ICONS.HELP} label={__('Help')} />
            </>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}
