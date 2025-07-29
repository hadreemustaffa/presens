import { getActiveUser } from '@/api';
import AccountInformationForm from '@/features/users/components/account-information-form';
import ChangeEmailForm from '@/features/users/components/change-email-form';
import ChangePasswordForm from '@/features/users/components/change-password-form';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account informations.',
};

export default async function Page() {
  const data = await getActiveUser();

  return (
    <div className="mx-4 flex h-full flex-col @[768px]/main:items-center @[768px]/main:justify-center">
      <AccountInformationForm
        department={data.user.user_metadata.department}
        full_name={data.user.user_metadata.full_name}
      />
      <ChangeEmailForm />
      <ChangePasswordForm />
    </div>
  );
}
