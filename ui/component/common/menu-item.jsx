// @flow
import React from 'react';
import { MenuItem } from '@reach/menu-button';
import Icon from 'component/common/icon';

type Props = {
  icon: string,
  label: string,
  onSelect: (any) => any,
};

export default function MenuItemButton(props: Props) {
  const { icon, label, onSelect } = props;

  return (
    <MenuItem className="comment__menu-option" onSelect={onSelect}>
      <div className="menu__link">
        <Icon aria-hidden icon={icon} />
        {label}
      </div>
    </MenuItem>
  );
}
