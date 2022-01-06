// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuLink } from '@reach/menu-button';
import Icon from 'component/common/icon';

type Props = {
  icon: string,
  label: string,
  page: string,
};

export default function MenuLinkButton(props: Props) {
  const { icon, label, page } = props;

  return (
    <MenuLink className="menu__link" as={Link} to={`/$/${page}`} onClick={(e) => e.stopPropagation()}>
      <Icon aria-hidden icon={icon} />
      {label}
    </MenuLink>
  );
}
