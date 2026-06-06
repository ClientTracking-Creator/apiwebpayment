const projectId = process.env.FIREBASE_PROJECT_ID || 'clienttrackingapp-43995';

export type AppSettingsData = {
  subscriptionExpiry: string;
  trialStartedAt: string;
};

const firestoreDocumentUrl = (profileId: string) => {
  const encodedUid = encodeURIComponent(profileId);
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodedUid}/settings/app_settings`;
};

const getStringField = (fields: Record<string, { stringValue?: string }> | undefined, key: string) =>
  fields?.[key]?.stringValue || '';

export const getAppSettings = async (profileId: string, firebaseIdToken: string): Promise<AppSettingsData> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(firestoreDocumentUrl(profileId), {
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`
    },
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore read failed: ${detail}`);
  }

  const data = await response.json();

  return {
    subscriptionExpiry: getStringField(data.fields, 'subscriptionExpiry'),
    trialStartedAt: getStringField(data.fields, 'trialStartedAt')
  };
};

export const updateSubscriptionExpiry = async (
  profileId: string,
  firebaseIdToken: string,
  subscriptionExpiry: string
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(`${firestoreDocumentUrl(profileId)}?updateMask.fieldPaths=subscriptionExpiry`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        subscriptionExpiry: { stringValue: subscriptionExpiry }
      }
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore update failed: ${detail}`);
  }
};
