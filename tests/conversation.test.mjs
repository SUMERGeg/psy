import assert from 'node:assert/strict';
import { test } from 'node:test';
import { conversationContent } from '../src/content/conversation.ts';
import { createConversationMessage, toggleThought } from '../src/lib/conversation.ts';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent, validatePublication } from '../src/content/validation.ts';

test('conversation requires an actual direction and thought; unknown IDs never become copy', () => {
  for (const [direction, ids] of [[null, ['voice']], ['unknown', ['voice']], ['relationships', []], ['relationships', ['unknown']]]) {
    assert.equal(createConversationMessage(conversationContent, direction, ids), '');
  }
});

test('conversation preserves phrase order within groups, drops duplicates and caps content at three thoughts', () => {
  const message = createConversationMessage(conversationContent, 'relationships', ['boundaries', 'voice', 'boundaries', 'wishes', 'criticism']);
  assert.ok(message.startsWith(conversationContent.directions[0].opening));
  const sentences = ['boundaries', 'voice', 'wishes'].map(id => conversationContent.thoughts.find(t => t.id === id).fragment);
  for (const sentence of sentences) assert.ok(message.includes(sentence));
  assert.ok(message.indexOf(sentences[0]) < message.indexOf(sentences[1]));
  assert.ok(message.indexOf(sentences[1]) < message.indexOf(sentences[2]));
  assert.ok(!message.includes(conversationContent.thoughts.find(t => t.id === 'criticism').fragment));
  assert.ok(message.endsWith(conversationContent.closing));
});

test('related thoughts become a single sentence with no repeated start', () => {
  assert.equal(createConversationMessage(conversationContent, 'relationships', ['voice', 'boundaries', 'criticism']),
    'Хочу поговорить об отношениях. Мне трудно говорить о своих желаниях и сказать «нет». Я часто критикую себя.\n\nМне важно обсудить это и лучше понять, что происходит.');
  assert.equal(createConversationMessage(conversationContent, 'self-esteem', ['criticism', 'comparison', 'situation']),
    'Хочу поговорить о том, как я отношусь к себе. Я часто критикую себя, сравниваю себя с другими и возвращаюсь мыслями к одной ситуации.\n\nМне важно обсудить это и лучше понять, что происходит.');
  assert.ok(createConversationMessage(conversationContent, 'uncertain', ['wishes', 'words'])
    .includes('Мне трудно понять, чего я хочу, и подобрать слова.'));
});

test('all one-to-three thought combinations retain exactly the chosen meaning across directions', () => {
  const choices = [[]];
  for (const thought of conversationContent.thoughts) {
    for (const choice of [...choices]) if (choice.length < 3) choices.push([...choice, thought.id]);
  }
  for (const direction of conversationContent.directions) for (const choice of choices.filter(ids => ids.length)) {
    const message = createConversationMessage(conversationContent, direction.id, choice);
    assert.equal(message.split('\n\n').length, 2);
    for (const thought of conversationContent.thoughts) {
      assert.equal(message.includes(thought.fragment), choice.includes(thought.id), `${direction.id}: ${choice}: ${thought.id}`);
    }
    for (const prefix of new Set(choice.map(id => conversationContent.thoughts.find(t => t.id === id).prefix))) {
      assert.equal(message.split(`${prefix} `).length - 1, 1);
    }
    assert.ok(!/undefined|\.\.| {2}/u.test(message));
  }
});

test('thought selection can be removed and cannot grow past three', () => {
  assert.deepEqual(toggleThought(['voice', 'wishes', 'criticism'], 'boundaries'), ['voice', 'wishes', 'criticism']);
  assert.deepEqual(toggleThought(['voice', 'wishes', 'criticism'], 'wishes'), ['voice', 'criticism']);
  assert.deepEqual(toggleThought(['voice'], 'wishes'), ['voice', 'wishes']);
});

test('conversation demo and drafts obey the content projection instead of leaking into the client', () => {
  assert.equal(getVisibleSiteContent(siteContent, 'preview', null).conversation.status, 'DEMO');
  const draft = structuredClone(siteContent);
  draft.conversation.status = 'DRAFT';
  assert.equal(getVisibleSiteContent(draft, 'preview', null).conversation, null);
  const invalid = structuredClone(siteContent);
  invalid.conversation.thoughts[0].title = '[TBD]';
  assert.ok(validatePublication(invalid, 'preview', null).some(error => error.includes('conversation')));
});
