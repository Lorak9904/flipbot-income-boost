import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildListingEditorUrl } from '@/lib/listing-editor/navigation';

/**
 * Legacy edit route adapter.
 *
 * We keep /user/items/:uuid/edit for compatibility, but redirect
 * to the unified review/edit flow under /add-item?edit=...
 * so category books and publish logic stay consistent.
 */
const EditItemPage = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();

  useEffect(() => {
    if (!uuid) {
      navigate('/user/items', { replace: true });
      return;
    }
    navigate(
      buildListingEditorUrl({
        mode: 'edit',
        itemId: uuid,
      }),
      { replace: true }
    );
  }, [navigate, uuid]);

  return null;
};

export default EditItemPage;
