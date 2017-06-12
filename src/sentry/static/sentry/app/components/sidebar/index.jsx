import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled, {css, cx} from 'react-emotion';

import {hideSidebar, showSidebar} from '../../actionCreators/sidebar';
import {load as loadIncidents} from '../../actionCreators/incidents';
import {t} from '../../locale';
import Broadcasts from './broadcasts';
import ConfigStore from '../../stores/configStore';
import IconSidebarBookmarks from '../../icons/icon-sidebar-bookmarks';
import IconSidebarCollapse from '../../icons/icon-sidebar-collapse';
import IconSidebarHistory from '../../icons/icon-sidebar-history';
import IconSidebarOverview from '../../icons/icon-sidebar-overview';
import IconSidebarUser from '../../icons/icon-sidebar-user';
import Incidents from './incidents';
import OnboardingStatus from './onboardingStatus';
import SentryTypes from '../../proptypes';
import SidebarDropdown from './sidebarDropdown';
import SidebarItem from './sidebarItem';
import SidebarStore from '../../stores/sidebarStore';

const ICON_SIZE = 22;

class Sidebar extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
    collapsed: PropTypes.bool,
    location: PropTypes.object,
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    jQuery(document.body).addClass('body-sidebar');
    jQuery(document).on('click', this.documentClickHandler);

    loadIncidents();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let {collapsed, location} = this.props;
    let nextLocation = nextContext.location;

    // Close active panel if we navigated anywhere
    if (nextLocation && location && location.pathname !== nextLocation.pathname) {
      this.hidePanel();
    }

    if (collapsed === nextProps.collapsed) return;

    if (nextProps.collapsed) {
      jQuery(document.body).addClass('collapsed');
    } else {
      jQuery(document.body).removeClass('collapsed');
    }
  }

  componentWillUnmount() {
    jQuery(document).off('click', this.documentClickHandler);
    jQuery(document.body).removeClass('body-sidebar');
  }

  toggleSidebar = () => {
    let {collapsed} = this.props;

    if (!collapsed) {
      hideSidebar();
    } else {
      showSidebar();
    }
  };

  hashChangeHandler = () => {
    if (window.location.hash == '#welcome') {
      this.setState({showTodos: true});
    }
  };

  // Hide slideout panel
  hidePanel = () => {
    this.setState({
      showPanel: false,
      currentPanel: '',
    });
  };

  // Show slideout panel
  showPanel = panel => {
    this.setState({
      showPanel: true,
      currentPanel: panel,
    });
  };

  togglePanel = (panel, e) => {
    if (this.state.currentPanel === panel) this.hidePanel();
    else this.showPanel(panel);
  };

  documentClickHandler = evt => {
    // If click occurs outside of sidebar, close any active panel
    if (this.sidebar && !this.sidebar.contains(evt.target)) {
      this.hidePanel();
    }
  };

  render() {
    let {organization, collapsed} = this.props;
    let {currentPanel, showPanel} = this.state;
    let config = ConfigStore.getConfig();
    let user = ConfigStore.get('user');
    let hasPanel = !!currentPanel;

    // TODO(billy): Handle no org state

    return (
      <StyledSidebar innerRef={ref => (this.sidebar = ref)} collapsed={collapsed}>
        <div>
          <SidebarSection>
            <SidebarDropdown
              collapsed={collapsed}
              org={organization}
              user={user}
              config={config}
            />
          </SidebarSection>

          <Separator />

          <SidebarSection>
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarOverview size={ICON_SIZE} />}
              label={t('Projects')}
              to={`/organizations/${organization.slug}/projects/`}
            />
          </SidebarSection>

          <Separator />

          <SidebarSection>
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarUser size={ICON_SIZE} />}
              label={t('Assigned to me')}
              to={`/organizations/${organization.slug}/issues/assigned/`}
            />
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarBookmarks size={ICON_SIZE} />}
              label={t('Starred issues')}
              to={`/organizations/${organization.slug}/issues/bookmarks/`}
            />
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarHistory size={ICON_SIZE} />}
              label={t('Recently viewed')}
              to={`/organizations/${organization.slug}/issues/history/`}
            />
          </SidebarSection>

          <Separator />
          <SidebarSection>
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarOverview size={ICON_SIZE} />}
              label={t('Activity')}
              to={`/organizations/${organization.slug}/activity/`}
            />
            <SidebarItem
              collapsed={collapsed}
              hasPanel={hasPanel}
              onClick={this.hidePanel}
              icon={<IconSidebarOverview size={ICON_SIZE} />}
              label={t('Stats')}
              to={`/organizations/${organization.slug}/stats/`}
            />
          </SidebarSection>
        </div>

        <div>
          <SidebarSection>
            <Broadcasts
              collapsed={collapsed}
              showPanel={showPanel}
              currentPanel={currentPanel}
              onShowPanel={() => this.togglePanel('broadcasts')}
              hidePanel={this.hidePanel}
            />
            <Incidents
              collapsed={collapsed}
              showPanel={showPanel}
              currentPanel={currentPanel}
              onShowPanel={() => this.togglePanel('statusupdate')}
              hidePanel={this.hidePanel}
            />
          </SidebarSection>

          <SidebarSection>
            <OnboardingStatus
              org={organization}
              currentPanel={currentPanel}
              onShowPanel={() => this.togglePanel('todos')}
              showPanel={showPanel}
              hidePanel={this.hidePanel}
              collapsed={collapsed}
            />
          </SidebarSection>

          <Separator />

          <SidebarSection>
            <SidebarItem
              collapsed={collapsed}
              icon={<StyledIconSidebarCollapse size={ICON_SIZE} collapsed={collapsed} />}
              label={t('Collapse')}
              onClick={this.toggleSidebar}
            />
          </SidebarSection>
        </div>
      </StyledSidebar>
    );
  }
}

const SidebarContainer = withRouter(
  createReactClass({
    displayName: 'SidebarContainer',
    mixins: [Reflux.connect(SidebarStore, 'sidebar')],

    render() {
      return (
        <Sidebar
          {...this.props}
          collapsed={this.state.sidebar && this.state.sidebar.collapsed}
        />
      );
    },
  })
);
export default SidebarContainer;

const StyledSidebar = styled('div')`
  background: ${p => p.theme.sidebar.background};
  color: ${p => p.theme.sidebar.color};
  line-height: 1;
  padding: 0 20px;
  width: ${p => p.theme.sidebar.expandedWidth};
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: ${p => p.theme.zIndex.sidebar};

  ${({theme, collapsed}) => collapsed && `width: ${theme.sidebar.collapsedWidth};`};
`;

const Separator = styled('hr')`
  width: 30px;
  border-top-color: ${p => p.theme.sidebar.divider};
  margin: 0;
`;

const SidebarSection = styled('div')`
  margin: 20px 0;
`;

const ExpandedIcon = css`
  transition: 0.3s transform ease;
  transform: rotate(0deg);
`;
const CollapsedIcon = css`
  transform: rotate(180deg);
`;
const StyledIconSidebarCollapse = styled(({className, collapsed, ...props}) => (
  <IconSidebarCollapse
    className={cx(className, ExpandedIcon, collapsed && CollapsedIcon)}
    {...props}
  />
))``;
