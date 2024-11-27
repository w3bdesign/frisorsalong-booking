import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from '../Card.vue';

describe('Card', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Test Title',
        value: '42'
      }
    });
    expect(wrapper.text()).toContain('Test Title');
    expect(wrapper.text()).toContain('42');
    expect(wrapper.find('.bg-indigo-100').exists()).toBe(true);
    expect(wrapper.find('.text-indigo-600').exists()).toBe(true);
  });

  it('applies different colors correctly', () => {
    const colors = ['green', 'blue', 'red', 'yellow'] as const;
    colors.forEach(color => {
      const wrapper = mount(Card, {
        props: {
          title: 'Test',
          value: '42',
          color
        }
      });
      expect(wrapper.find(`.bg-${color}-100`).exists()).toBe(true);
      expect(wrapper.find(`.text-${color}-600`).exists()).toBe(true);
    });
  });

  it('renders slot content', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Test',
        value: '42'
      },
      slots: {
        icon: '<svg data-testid="test-icon">Test Icon</svg>'
      }
    });
    expect(wrapper.find('[data-testid="test-icon"]').exists()).toBe(true);
  });

  it('formats number values correctly', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Test',
        value: 42
      }
    });
    expect(wrapper.text()).toContain('42');
  });

  it('renders with all props', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Complex Test',
        value: 1000,
        color: 'green'
      },
      slots: {
        icon: '<svg data-testid="test-icon">Test Icon</svg>'
      }
    });
    expect(wrapper.text()).toContain('Complex Test');
    expect(wrapper.text()).toContain('1000');
    expect(wrapper.find('.bg-green-100').exists()).toBe(true);
    expect(wrapper.find('.text-green-600').exists()).toBe(true);
    expect(wrapper.find('[data-testid="test-icon"]').exists()).toBe(true);
  });
});
