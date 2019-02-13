import React from 'react';
import PropTypes from 'prop-types';
import { themeGet } from 'styled-system';
import { withHandlers, withState, compose } from 'recompose';
import styled from 'styled-components';
import { Search } from 'styled-icons/octicons/Search.cjs';

import { escapeInput } from '../lib/utils';
import { H4 } from './Text';

import Container from './Container';
import StyledCard from './StyledCard';
import StyledRadioList from './StyledRadioList';
import StyledInput from './StyledInput';
import GithubRepositoryEntry from './GithubRepositoryEntry';

const SearchIcon = styled(Search)`
  color: ${themeGet('colors.black.300')};
`;

const RepositoryEntryContainer = styled(Container)`
  cursor: pointer;
  &:hover {
    background: ${themeGet('colors.black.50')};
  }
`;

const enhance = compose(
  withState('state', 'setState', { search: '' }),
  withHandlers({
    onSearch: ({ setState }) => ({ target }) => {
      setState(state => ({
        ...state,
        search: target.value,
      }));
    },
  }),
);

const GithubRepositories = enhance(
  ({ repositories, onSearch, onCreateCollective, creatingCollective, state, ...fieldProps }) => {
    if (state.search) {
      const test = new RegExp(escapeInput(state.search), 'i');
      repositories = repositories.filter(repository => repository.name.match(test));
    }

    const showSearch = true; // repositories.length >= 5;
    return (
      <StyledCard maxWidth={500} minWidth={464}>
        {showSearch && (
          <Container display="flex" borderBottom="1px solid" borderColor="black.200" px={4} py={1} alignItems="center">
            <SearchIcon size="16" />
            <StyledInput
              bare
              type="text"
              fontSize="Paragraph"
              lineHeight="Paragraph"
              placeholder="Filter by name..."
              onChange={onSearch}
              ml={2}
            />
          </Container>
        )}

        {repositories.length === 0 && (
          <Container my={3}>
            <H4 textAlign="center" fontSize="1.4rem" color="black.400">
              No repository match
            </H4>
          </Container>
        )}
        <StyledRadioList {...fieldProps} options={repositories} keyGetter="name">
          {({ value, radio, checked }) => {
            return (
              <RepositoryEntryContainer px={4} py={3}>
                <GithubRepositoryEntry
                  radio={radio}
                  value={value}
                  checked={checked}
                  onCreateCollective={onCreateCollective}
                  creatingCollective={creatingCollective}
                />
              </RepositoryEntryContainer>
            );
          }}
        </StyledRadioList>
      </StyledCard>
    );
  },
);

GithubRepositories.propTypes = {
  repositories: PropTypes.array.isRequired,
  creatingCollective: PropTypes.bool,
  onCreateCollective: PropTypes.func.isRequired,
};

export default GithubRepositories;
