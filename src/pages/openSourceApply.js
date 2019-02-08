import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from '@rebass/grid';

import Page from '../components/Page';
import Loading from '../components/Loading';
import { withUser } from '../components/UserProvider';
import withIntl from '../lib/withIntl';
import { addCreateCollectiveMutation } from '../graphql/mutations';
import StyledCard from '../components/StyledCard';
import { H3, P } from '../components/Text';
import StyledButton from '../components/StyledButton';
import GithubRepositories from '../components/GithubRepositories';
import StyledInputField from '../components/StyledInputField';
import MessageBox from '../components/MessageBox';
import SignInOrJoinFree from '../components/SignInOrJoinFree';
import { Router } from '../server/pages';

import { getGithubRepos } from '../lib/api';

const { WEBSITE_URL } = process.env;

class OpenSourceApplyPage extends Component {
  static async getInitialProps({ query }) {
    return {
      token: query && query.token,
    };
  }

  static propTypes = {
    token: PropTypes.string,
    loadingLoggedInUser: PropTypes.bool,
    LoggedInUser: PropTypes.object,
    createCollective: PropTypes.func,
  };

  state = {
    result: {},
    loadingRepos: false,
    repositories: [],
    creatingCollective: false,
  };

  async componentDidMount() {
    const { token } = this.props;
    if (!token) {
      return;
    }
    this.setState({ loadingRepos: true });

    try {
      const repositories = await getGithubRepos(token);
      if (repositories.length !== 0) {
        this.setState({ repositories, loadingRepos: false, result: {} });
      } else {
        this.setState({
          loadingRepos: false,
          result: { type: 'info', mesg: 'Info: No Repository found' },
        });
      }
    } catch (error) {
      this.setState({
        loadingRepos: false,
        result: { type: 'error', mesg: 'Error: An unknown error occured' },
      });
      console.log(error);
    }
  }

  renderContent() {
    const { token, LoggedInUser } = this.props;
    const { repositories } = this.state;

    if (!LoggedInUser) {
      return <SignInOrJoinFree redirect={Router.asPath} />;
    } else if (!token || repositories.length === 0) {
      return this.renderConnectGithubButton();
    } else {
      return this.renderGithubRepos();
    }
  }

  async createCollectives(collectiveInputType) {
    collectiveInputType.type = 'COLLECTIVE';
    try {
      const res = await this.props.createCollective(collectiveInputType);
      const collective = res.data.createCollective;
      Router.pushRoute('collective', { slug: collective.slug });
    } catch (err) {
      console.error('>>> createCollective error: ', JSON.stringify(err)); // TODO - Remove
      const errorMsg = err.graphQLErrors && err.graphQLErrors[0] ? err.graphQLErrors[0].message : err.message;
      this.setState({
        creatingCollective: false,
        result: { type: 'error', mesg: errorMsg },
      });
      // throw new Error(errorMsg);
    }
  }

  renderGithubRepos() {
    const { repositories, creatingCollective } = this.state;
    if (repositories.length !== 0) {
      return (
        <StyledInputField htmlFor="collective">
          {fieldProps => (
            <GithubRepositories
              {...fieldProps}
              repositories={repositories}
              creatingCollective={creatingCollective}
              onCreateCollective={data => {
                this.setState({ creatingCollective: true });
                this.createCollectives(data);
              }}
            />
          )}
        </StyledInputField>
      );
    }
  }

  renderConnectGithubButton() {
    const connectUrl = `/api/connected-accounts/github?redirect=${WEBSITE_URL}/opensource/apply`;
    return (
      <StyledCard minWidth={400} maxWidth={500} border="none" minHeight={350} p={4} textAlign="center">
        <H3 mb={2}>For Open Source projects</H3>
        <P mb={4}>
          You need a Github account and a repository with over 100 stars. If you run into trouble, file an issue in our
          Github Issues section.
        </P>
        <StyledButton
          textAlign="center"
          buttonSize="large"
          buttonStyle="primary"
          onClick={() => {
            window.location.replace(connectUrl);
          }}
          loading={this.state.loadingRepos}
          disabled={this.state.loadingRepos}
        >
          Get started
        </StyledButton>
      </StyledCard>
    );
  }

  render() {
    const { loadingLoggedInUser } = this.props;
    const { result } = this.state;
    return (
      <Page>
        <Flex alignItems="center" flexDirection="column" mx="auto" maxWidth={500} pt={4} my={4}>
          {result.mesg && (
            <Box>
              <MessageBox withIcon type={result.type}>
                {result.mesg}
              </MessageBox>
            </Box>
          )}
          {loadingLoggedInUser ? <Loading /> : this.renderContent()}
        </Flex>
      </Page>
    );
  }
}

export default withIntl(withUser(addCreateCollectiveMutation(OpenSourceApplyPage)));
