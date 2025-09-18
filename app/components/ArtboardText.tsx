import {useState, useEffect} from 'react';
import {useArtboards} from '~/context/artboards';
import {Field, Label} from '~/ui/fieldset';
import {Input} from '~/ui/input';
import {Button} from '~/ui/button';

export function ArtboardText() {
  const {title, subtitle, setTitle, setSubtitle, status, render} = useArtboards();

  const [localTitle, setLocalTitle] = useState(title ?? '');
  const [localSubtitle, setLocalSubtitle] = useState(subtitle ?? '');

  // Sync local state when context changes (e.g., schematic switched)
  useEffect(() => {
    setLocalTitle(title ?? '');
  }, [title]);
  
  useEffect(() => {
    setLocalSubtitle(subtitle ?? '');
  }, [subtitle]);

  const isDirty = (localTitle ?? '') !== (title ?? '') || (localSubtitle ?? '') !== (subtitle ?? '');
  const isDisabled = status !== 'ready' || !isDirty;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTitle(localTitle || undefined);
    setSubtitle(localSubtitle || undefined);
    render();
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <Field>
        <Label>Title</Label>
        <Input
          type="text"
          name="artboardTitle"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Enter title"
        />
      </Field>
      <Field>
        <Label>Subtitle</Label>
        <Input
          type="text"
          name="artboardSubtitle"
          value={localSubtitle}
          onChange={(e) => setLocalSubtitle(e.target.value)}
          placeholder="Enter subtitle"
        />
      </Field>
      <div>
        <Button type="submit" disabled={isDisabled}>Update Text</Button>
      </div>
    </form>
  );
}