import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../Button.vue';

describe('Button', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test Button'
      }
    });
    expect(wrapper.text()).toBe('Test Button');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.classes()).toContain('bg-indigo-600'); // primary variant
  });

  it('applies different variants correctly', () => {
    const variants = {
      primary: 'bg-indigo-600',
      secondary: 'bg-white',
      danger: 'bg-red-600'
    };

    Object.entries(variants).forEach(([variant, expectedClass]) => {
      const wrapper = mount(Button, {
        props: { variant: variant as 'primary' | 'secondary' | 'danger' }
      });
      expect(wrapper.classes()).toContain(expectedClass);
    });
  });

  it('applies different sizes correctly', () => {
    const sizes = {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3'
    };

    Object.entries(sizes).forEach(([size, expectedClass]) => {
      const wrapper = mount(Button, {
        props: { size: size as 'sm' | 'md' | 'lg' }
      });
      expect(wrapper.classes()).toContain(expectedClass.split(' ')[0]);
    });
  });

  it('shows loading spinner when loading prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    });
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('emits click event when clicked and not disabled', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('does not emit click event when loading', async () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('applies custom class names', () => {
    const customClass = 'custom-test-class';
    const wrapper = mount(Button, {
      props: {
        className: customClass
      }
    });
    expect(wrapper.classes()).toContain(customClass);
  });

  it('renders as submit button when type is submit', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'submit'
      }
    });
    expect(wrapper.attributes('type')).toBe('submit');
  });
});
