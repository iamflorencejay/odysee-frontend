// @flow
import React from 'react';
import Page from 'component/page';
import Card from 'component/common/card';
import Button from 'component/button';
import * as PAGES from 'constants/pages';

const CareersPage = () => {
  return (
    <Page>
      <Card
        className="careers-overview-page"
        body={
          <>
            <h1>Work at Odysee</h1>

            <section className="section card--section">
              <h2 className="card__title">We're redefining online media because the current paradigm sucks.</h2>

              <h2 className="career-page__subtitle">
                If you share our passion and want to help we'd love to hear from you.
              </h2>

              <div className="job-listings">
                <Button
                  label={__('IT Project Manager')}
                  navigate={`/$/${PAGES.CAREERS_IT_PROJECT_MANAGER}`}
                  className="job-listing"
                />
              </div>
            </section>
          </>
        }
      />
    </Page>
  );
};

export default CareersPage;
