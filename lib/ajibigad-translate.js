'use babel';

import AjibigadTranslateView from './ajibigad-translate-view';
import { CompositeDisposable } from 'atom';
import axios from 'axios';

export default {

  ajibigadTranslateView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.ajibigadTranslateView = new AjibigadTranslateView(state.ajibigadTranslateViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.ajibigadTranslateView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ajibigad-translate:translate': () => this.translate()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.ajibigadTranslateView.destroy();
  },

  serialize() {
    return {
      ajibigadTranslateViewState: this.ajibigadTranslateView.serialize()
    };
  },

  async translate() {
    console.log('Ajibigad Translate was called!');
    const editor = atom.workspace.getActiveTextEditor()
    const selection = editor.getLastSelection()
    if (editor && selection.getText()) {
      axios.get(`http://localhost:3000/translate?q=${selection.getText()}`)
        .then(response => {
          editor.insertText(response.data.translatedText);
        })
        .catch(error => {
          this.notifyError('Translation failed. Please confirm translation server is running on port 3000')
        });
    }
  },

  notifyError(message) {
    atom.notifications.addError(message, {
        dismissable: true
      })
  }

};
