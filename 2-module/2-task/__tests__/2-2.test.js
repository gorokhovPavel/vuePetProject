const { shallowMount } = require('@vue/test-utils');
const { getSolutionPath } = require('taskbook-test-utils');
const { MeetupInfo } = require(getSolutionPath('MeetupInfo'));
const { MeetupAgenda } = require(getSolutionPath('MeetupAgenda'));
const { MeetupAgendaItem } = require(getSolutionPath('MeetupAgendaItem'));
const { MeetupCover } = require(getSolutionPath('MeetupCover'));
const { MeetupDescription } = require(getSolutionPath('MeetupDescription'));
const { MeetupView } = require(getSolutionPath('MeetupView'));
const { MeetupPage } = require(getSolutionPath('MeetupPage'));
const { mockMeetup } = require('./mock-meetup');
const { getMeetupCoverLink } = require('../data');

describe('2-module-2-task', () => {
  describe('MeetupCover', () => {
    it('MeetupCover должен иметь необязательные строковые пропсы link и title', () => {
      const wrapper = shallowMount(MeetupCover);
      expect(wrapper.vm.$options.props.link.type).toBe(String);
      expect(wrapper.vm.$options.props.link.required).toBeFalsy();
      expect(wrapper.vm.$options.props.title.type).toBe(String);
      expect(wrapper.vm.$options.props.title.required).toBeFalsy();
    });

    it('MeetupCover должен рендерить изображение митапа', () => {
      const link = getMeetupCoverLink(mockMeetup);
      const wrapper = shallowMount(MeetupCover, {
        propsData: {
          link,
        },
      });
      expect(wrapper.find('.meetup-cover').attributes().style).toContain(link);
    });

    it('MeetupCover должен корректно обрабатывать отсутствие ссылки на изображение', () => {
      const wrapper = shallowMount(MeetupCover);
      expect(wrapper.find('.meetup-cover').attributes().style).toBeFalsy();
    });

    it('MeetupCover должен рендерить название митапа', () => {
      const { title } = mockMeetup;
      const wrapper = shallowMount(MeetupCover, {
        propsData: {
          title,
        },
      });

      expect(wrapper.find('.meetup-cover__title').text()).toEqual(title);
    });
  });

  describe('MeetupDescription', () => {
    it('MeetupDescription должен иметь необязательный строковый пропс description', () => {
      const wrapper = shallowMount(MeetupDescription);
      expect(wrapper.vm.$options.props.description.type).toBe(String);
      expect(wrapper.vm.$options.props.description.required).toBeFalsy();
    });

    it('MeetupDescription должен рендерить описание митапа', () => {
      const wrapper = shallowMount(MeetupDescription, {
        propsData: { description: mockMeetup.description },
      });
      expect(wrapper.text()).toBe(mockMeetup.description);
    });
  });

  describe('MeetupInfo', () => {
    it('MeetupInfo должен иметь обязательный пропс meetup', () => {
      const wrapper = shallowMount(MeetupInfo, {
        propsData: { meetup: mockMeetup },
      });
      expect(wrapper.vm.$options.props.meetup.type).toBe(Object);
      expect(wrapper.vm.$options.props.meetup.required).toBeTruthy();
    });

    it('MeetupInfo должен рендерить краткое описание митапа', () => {
      const wrapper = shallowMount(MeetupInfo, {
        propsData: { meetup: mockMeetup },
      });
      expect(wrapper.find('.info-list li:nth-child(1)').text()).toBe(
        mockMeetup.organizer,
      );
      expect(wrapper.find('.info-list li:nth-child(2)').text()).toBe(
        mockMeetup.place,
      );
      expect(wrapper.find('.info-list li:nth-child(3)').text()).toBe(
        new Date(mockMeetup.date).toLocaleString(navigator.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      );
    });
  });

  describe('MeetupAgendaItem', () => {
    it('MeetupAgendaItem должен иметь обязательный пропс agendaItem', () => {
      const wrapper = shallowMount(MeetupAgendaItem, {
        propsData: { agendaItem: mockMeetup.agenda[0] },
      });
      expect(wrapper.vm.$options.props.agendaItem.type).toBe(Object);
      expect(wrapper.vm.$options.props.agendaItem.required).toBeTruthy();
    });

    it('MeetupAgendaItem должен показывать время', () => {
      const agendaItem = mockMeetup.agenda[0];
      const wrapper = shallowMount(MeetupAgendaItem, {
        propsData: { agendaItem },
      });
      expect(
        wrapper
          .find('.meetup-agenda__item .meetup-agenda__item-col:nth-child(2)')
          .text(),
      ).toBe(`${agendaItem.startsAt} - ${agendaItem.endsAt}`);
    });

    it('MeetupAgendaItem должен показывать заголовок по умолчанию', () => {
      const agendaItem = mockMeetup.agenda[0];
      const wrapper = shallowMount(MeetupAgendaItem, {
        propsData: { agendaItem },
      });
      expect(wrapper.find('.meetup-agenda__title').text()).toBe('Регистрация');
    });

    it('MeetupAgendaItem должен показывать иконку регистрации', () => {
      const agendaItem = mockMeetup.agenda[0];
      const wrapper = shallowMount(MeetupAgendaItem, {
        propsData: { agendaItem },
      });
      expect(
        wrapper.find('.meetup-agenda__item-col img').attributes().src,
      ).toContain('key.svg');
    });

    it('MeetupAgendaItem должен показывать доклад', () => {
      const agendaItem = mockMeetup.agenda[2];
      const wrapper = shallowMount(MeetupAgendaItem, {
        propsData: { agendaItem },
      });
      expect(
        wrapper.find('.meetup-agenda__item-col img').attributes().src,
      ).toContain('tv.svg');
      expect(wrapper.find('.meetup-agenda__title').text()).toBe(
        agendaItem.title,
      );
      expect(
        wrapper
          .find('.meetup-agenda__item .meetup-agenda__item-col:nth-child(2)')
          .text(),
      ).toBe(`${agendaItem.startsAt} - ${agendaItem.endsAt}`);
      expect(wrapper.find('.meetup-agenda__lang').text()).toBe(
        agendaItem.language,
      );
      expect(wrapper.find('.meetup-agenda__item').text()).toContain(
        agendaItem.speaker,
      );
      expect(wrapper.find('.meetup-agenda__item').text()).toContain(
        agendaItem.description,
      );
    });
  });

  describe('MeetupAgenda', () => {
    it('MeetupAgenda должен иметь пропс agenda', () => {
      const wrapper = shallowMount(MeetupAgenda, {
        propsData: { agenda: mockMeetup.agenda },
      });
      expect(wrapper.vm.$options.props.agenda.type).toBe(Array);
    });

    it('MeetupAgenda должен выводить программу', () => {
      const wrapper = shallowMount(MeetupAgenda, {
        propsData: { agenda: mockMeetup.agenda },
      });
      expect(wrapper.findAllComponents(MeetupAgendaItem)).toHaveLength(
        mockMeetup.agenda.length,
      );
    });
  });

  describe('MeetupView', () => {
    it('MeetupView должен иметь пропс meetup', () => {
      const wrapper = shallowMount(MeetupView, {
        propsData: { meetup: mockMeetup },
      });
      expect(wrapper.vm.$options.props.meetup.type).toBe(Object);
      expect(wrapper.vm.$options.props.meetup.required).toBe(true);
    });

    it('MeetupView должен показывать изображение, описание информацию и программу', () => {
      const wrapper = shallowMount(MeetupView, {
        propsData: { meetup: mockMeetup },
      });
      expect(wrapper.findComponent(MeetupCover).exists()).toBeTruthy();
      expect(wrapper.findComponent(MeetupDescription).exists()).toBeTruthy();
      expect(wrapper.findComponent(MeetupInfo).exists()).toBeTruthy();
      expect(wrapper.findComponent(MeetupAgenda).exists()).toBeTruthy();
    });
  });

  describe('MeetupPage', () => {
    it('MeetupPage должен быть определён', () => {
      expect(MeetupPage).toBeDefined();
    });
  });
});
