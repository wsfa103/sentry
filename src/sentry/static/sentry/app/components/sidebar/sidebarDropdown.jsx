import PropTypes from 'prop-types';
import React from 'react';
import styled, {css} from 'react-emotion';

import {t} from '../../locale';
import Avatar from '../avatar';
import DropdownMenu from '../dropdownMenu';
import InlineSvg from '../inlineSvg';
import Link from '../link';
import SentryTypes from '../../proptypes';
import TextOverflow from '../textOverflow';
import withOrganizations from '../../utils/withOrganizations';

const UserSummary = styled('div')`
  display: flex;
  padding: 10px 15px;
`;
const UserSummaryUserName = styled('div')`
  font-weight: bold;
  padding-left: 10px;
  align-self: center;
`;

class SidebarUserSummary extends React.Component {
  static propTypes = {
    user: SentryTypes.User,
  };

  render() {
    let {user} = this.props;

    return (
      <UserSummary>
        <Avatar user={user} size={24} />
        <UserSummaryUserName>{user.name}</UserSummaryUserName>
      </UserSummary>
    );
  }
}

const OrgSummary = styled('div')`
  display: flex;
  padding: 10px 15px;
  overflow: hidden;
`;
const SummaryOrgName = styled('div')`
  color: ${p => p.theme.gray5};
  font-size: 16px;
  line-height: 1.1;
  font-weight: bold;
  margin-bottom: 4px;
`;
const SummaryOrgDetails = styled('div')`
  color: ${p => p.theme.gray3};
  font-size: 14px;
  line-height: 1;
`;
const Details = styled('div')`
  padding-left: 10px;
`;

class SidebarOrgSummary extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  render() {
    let {organization} = this.props;
    let projects = organization.projects && organization.projects.length;
    let extra = [];

    if (projects) {
      extra.push(`${projects} projects`);
    }

    return (
      <OrgSummary>
        <Avatar css={{flexShrink: 0}} organization={organization} size={36} />

        <Details>
          <SummaryOrgName>
            <TextOverflow>{organization.name}</TextOverflow>
          </SummaryOrgName>
          <SummaryOrgDetails>
            <TextOverflow>{extra.join(', ')}</TextOverflow>
          </SummaryOrgDetails>
        </Details>
      </OrgSummary>
    );
  }
}

class SidebarMenuItem extends React.Component {
  static propTypes = {
    to: PropTypes.string,
    href: PropTypes.string,
  };
  render() {
    let {children, to, href, ...props} = this.props;
    let hasMenu = !to && !href;

    return (
      <MenuItemLink to={to} href={href} {...props}>
        <MenuItemLabel hasMenu={hasMenu}>{children}</MenuItemLabel>
      </MenuItemLink>
    );
  }
}

/**
 * Switch Organization Menu Label + Sub Menu
 */
class SwitchOrganization extends React.Component {
  static propTypes = {
    organizations: PropTypes.arrayOf(SentryTypes.Organization),
  };

  render() {
    let {organizations} = this.props;

    return (
      <DropdownMenu isNestedDropdown>
        {({isOpen, getMenuProps, getActorProps}) => {
          return (
            <React.Fragment>
              <SwitchOrganizationMenuActor {...getActorProps()}>
                {t('Switch organization')}

                <SubMenuCaret>
                  <i className="icon-arrow-right" />
                </SubMenuCaret>
              </SwitchOrganizationMenuActor>

              {isOpen && (
                <SwitchOrganizationMenu {...getMenuProps({isStyled: true})}>
                  {organizations.map(organization => (
                    <SidebarMenuItem
                      key={organization.slug}
                      to={`/${organization.slug}/`}
                    >
                      <SidebarOrgSummary organization={organization} />
                    </SidebarMenuItem>
                  ))}
                  <Divider />
                  <SidebarMenuItem to={'/organizations/new/'}>
                    <InlineSvg src="icon-circle-add" /> {t('Create a new organization')}
                  </SidebarMenuItem>
                </SwitchOrganizationMenu>
              )}
            </React.Fragment>
          );
        }}
      </DropdownMenu>
    );
  }
}
const SwitchOrganizationContainer = withOrganizations(SwitchOrganization);

class SidebarDropdown extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    org: SentryTypes.Organization,
    user: SentryTypes.User,
    config: SentryTypes.Config,
  };

  render() {
    let {org, collapsed, config, user} = this.props;

    return (
      <DropdownMenu>
        {({isOpen, getRootProps, getActorProps, getMenuProps}) => {
          return (
            <SidebarDropdownRoot {...getRootProps({isStyled: true})}>
              <SidebarDropdownActor {...getActorProps({isStyled: true})}>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <Avatar
                    css={{marginRight: collapsed ? 0 : 12}}
                    organization={org}
                    size={32}
                  />
                  {!collapsed && (
                    <div>
                      <DropdownOrgName>
                        {org.name} <i className="icon-arrow-down" />
                      </DropdownOrgName>
                      <DropdownUserName>{user.name}</DropdownUserName>
                    </div>
                  )}
                </div>
              </SidebarDropdownActor>

              {isOpen && (
                <OrgAndUserMenu {...getMenuProps({isStyled: true, org})}>
                  <SidebarOrgSummary organization={org} />
                  <SidebarMenuItem to={`/settings/${org.slug}/`}>
                    {t('Organization settings')}
                  </SidebarMenuItem>
                  <SidebarMenuItem to={`/organizations/${org.slug}/teams/`}>
                    {t('Projects')}
                  </SidebarMenuItem>
                  <SidebarMenuItem to={`/settings/${org.slug}/members/`}>
                    {t('Members')}
                  </SidebarMenuItem>
                  <SidebarMenuItem to={`/settings/${org.slug}/billing/`}>
                    {t('Usage & Billing')}
                  </SidebarMenuItem>
                  {!config.isOnPremise ? (
                    <SidebarMenuItem to={`/organizations/${org.slug}/support/`}>
                      {t('Support')}
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuItem href="https://forum.sentry.io/">
                      {t('Support forum')}
                    </SidebarMenuItem>
                  )}

                  <SidebarMenuItem>
                    <SwitchOrganizationContainer />
                  </SidebarMenuItem>

                  <Divider />

                  <SidebarUserSummary user={user} />

                  <div>
                    <SidebarMenuItem href="/settings/account/">
                      {t('User settings')}
                    </SidebarMenuItem>
                    <SidebarMenuItem to={'/settings/account/api/'}>
                      {t('API keys')}
                    </SidebarMenuItem>
                    {user.isSuperuser && (
                      <SidebarMenuItem href={'/manage/'}>{t('Admin')}</SidebarMenuItem>
                    )}
                    <SidebarMenuItem href="/auth/logout/">
                      {t('Sign out')}
                    </SidebarMenuItem>
                  </div>
                </OrgAndUserMenu>
              )}
            </SidebarDropdownRoot>
          );
        }}
      </DropdownMenu>
    );
  }
}

export default SidebarDropdown;

const SidebarDropdownRoot = styled('div')`
  position: relative;
`;

const DropdownOrgName = styled('div')`
  font-size: 16px;
  font-weight: bold;
  color: ${p => p.theme.white};
  text-shadow: 0 0 6px rgba(255, 255, 255, 0);
  transition: 0.15s text-shadow linear;
`;

const DropdownUserName = styled('div')`
  font-size: 14px;
  line-height: 16px;
  margin-bottom: -4px;
  transition: 0.15s color linear;
`;

const SidebarDropdownActor = styled('div')`
  cursor: pointer;

  &:hover {
    ${DropdownOrgName} {
      text-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
    }
    ${DropdownUserName} {
      color: ${p => p.theme.gray3};
    }
  }
`;

const Divider = styled('div')`
  height: 0;
  text-indent: -9999em;
  border-bottom: 1px solid ${p => p.theme.borderLight};
  margin: 5px 0;
`;

const MenuItemLabel = styled('span')`
  flex: 1;
  ${p =>
    p.hasMenu
      ? css`
          margin: 0 -15px;
          padding: 0 15px;
        `
      : css`
          overflow: hidden;
        `};
`;

const MenuItemLink = styled(({to, href, ...props}) => {
  if (to || href) {
    return <Link to={to} href={href} {...props} />;
  }

  return <div {...props} />;
})`
  color: ${p => p.theme.gray5};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  line-height: 32px;
  padding: 0 ${p => p.theme.sidebar.menuSpacing};
  position: relative;
  transition: 0.1s all linear;
  ${p => (!!p.to || !!p.href) && 'overflow: hidden'};

  &:hover,
  &:active {
    background: ${p => p.theme.gray1};
    color: ${p => p.theme.gray5};
  }

  ${OrgSummary} {
    padding-left: 0;
    padding-right: 0;
  }
`;

const SubMenuCaret = styled('span')`
  color: ${p => p.theme.gray2};
  transition: 0.1s color linear;

  &:hover,
  &:active {
    color: ${p => p.theme.gray3};
  }
`;

const SidebarDropdownMenu = p => css`
  position: absolute;
  background: ${p.theme.white};
  color: ${p.theme.gray5};
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 20px 0 rgba(0, 0, 0, 0.3);
  padding: 5px 0;
  width: 250px;
  z-index: 1000;
`;

const OrgAndUserMenu = styled('div')`
  ${SidebarDropdownMenu};
  top: 42px;
  min-width: 180px;
`;

// Menu Item in dropdown to "Switch organization"
const SwitchOrganizationMenuActor = styled('span')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -${p => p.theme.sidebar.menuSpacing};
  padding: 0 ${p => p.theme.sidebar.menuSpacing};
`;

const SwitchOrganizationMenu = styled('div')`
  ${SidebarDropdownMenu};
  top: 0;
  left: 256px;
`;
