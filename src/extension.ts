// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "generate-code-comments" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('generate-code-comments.vscodegen', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        // Capture selected code
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const language = editor.document.languageId;

        // Start process of creating code comments
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 50 });

            try {
                // Sending selected text as payload
                const response = await axios.post('https://ps.pndsn.com/v1/blocks/sub-key/sub-c-74b3b012-cba9-473c-98db-9cbb6b943cfc/generate', {
                    text: text,
                    language: language,
                });

                progress.report({ increment: 90 });

                // Insert the response from the API (converted to a string) at the current cursor position
                await editor.edit(editBuilder => {
                    editBuilder.insert(selection.start, response.data);
                });
                await vscode.commands.executeCommand('editor.action.formatDocument');
            } catch (error) {
                vscode.window.showInformationMessage('Error while calling API');
                console.error(error);
            }

            progress.report({ increment: 100 });
        });
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
