import { useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { REQUEST_TYPES } from '../choices';
import { RequestWizard } from '../components/RequestWizard';
import { useParamUpdater } from '../searchParams';
import type { RequestType, UserSettings } from '../types';
import { usePageTitle } from '../usePageTitle';

const OFFERS: { type: RequestType; button: string; description: string }[] = [
  {
    type: 'Equipment',
    button: 'Request equipment',
    description: 'Laptops, monitors, keyboards, headsets and other hardware, delivered or picked up.',
  },
  { type: 'Software', button: 'Request software', description: 'Licenses for design, development and business tools.' },
  { type: 'Access', button: 'Request access', description: 'Access to company systems, from read only to administrator.' },
];

/** The request types. A wizard opens for the type in ?new=, so /catalog?new=Access goes straight to it. */
export default function CatalogPage() {
  usePageTitle('New request');
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const settings = useLoad<UserSettings>('/api/settings');
  const open = REQUEST_TYPES.find((type) => type === params.get('new'));
  // Keep the last type so the wizard's content stays put while it closes.
  const [shown, setShown] = useState<RequestType>(open ?? 'Equipment');
  if (open && open !== shown) setShown(open);

  return (
    <>
      <h1 className="h3" data-testid="new-request-heading">
        New request
      </h1>
      <p className="text-body-secondary" data-testid="new-request-intro-text">
        Choose what you need. Each request takes a few short steps, and an admin approves it.
      </p>
      <Row xs={1} md={3} className="g-3">
        {OFFERS.map(({ type, button, description }) => {
          const typeId = type.toLowerCase();
          return (
            <Col key={type}>
              <Card className="h-100" data-testid={`${typeId}-offer-card`}>
                <Card.Body className="d-flex flex-column">
                  <Card.Title as="h2" className="h5" data-testid={`${typeId}-offer-heading`}>
                    {type}
                  </Card.Title>
                  <Card.Text className="flex-grow-1" data-testid={`${typeId}-offer-text`}>
                    {description}
                  </Card.Text>
                  <Button onClick={() => update({ new: type })} data-testid={`request-${typeId}-button`}>
                    {button}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      <RequestWizard
        type={open ?? shown}
        show={Boolean(open) && !settings.loading}
        defaultPriority={settings.data?.default_priority ?? 'Normal'}
        onClose={() => update({ new: null })}
      />
    </>
  );
}
