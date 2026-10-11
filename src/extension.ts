import vscode = require('vscode');

export function activate(Context: vscode.ExtensionContext)
{
    // Creates the status bar word counter
    const StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    
    let IsVisible = true;

    // Registers the word-count.show command
    Context.subscriptions.push(vscode.commands.registerCommand('word-count.show', () => { IsVisible = true; StatusBarItem.show(); }));

    // Registers the word-count.hide command
    Context.subscriptions.push(vscode.commands.registerCommand('word-count.hide', () => { IsVisible = false; StatusBarItem.hide(); }));

    // Toggle visibility when clicking on status bar item
    StatusBarItem.command = 'word-count.toggle';

    Context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'word-count.toggle',
            async () =>
            {
                if (IsVisible)
                {
                    const Confirmation = await vscode.window.showWarningMessage('Are you sure you want to hide the word and character count?', 'Yes', 'Cancel');
                    
                    if (Confirmation === 'Yes')
                    {
                        IsVisible = false;
                        StatusBarItem.hide();
                        
                        await vscode.window.showInformationMessage('Word and character count is hidden. You can have it displayed back by running "Word Count: Show" in the Command Palette (Ctrl+Shift+P).');
                    }
                }
                else
                {
                    IsVisible = true;
                    StatusBarItem.show();
                }
            }
        )
    );

    // Counts the number of words in a passed-in string
    const CountWords = (Text: string): number => Text.split(/\s+/g).filter((Word) => Word).length;

    // Gets the document text (or selection if any)
    const GetText = (): string | null =>
    {
        const Editor = vscode.window.activeTextEditor;
        
        if (!Editor) { return null; }
        
        const Document = Editor.document;
        const Selection = Editor.selection;
        
        return Selection.isEmpty ? Document.getText() : Document.getText(Selection);
    };

    // Updates the status bar text with word and character count
    const SetWordCount = (): null | void =>
    {
        const Text = GetText();
        
        if (Text === null) { return null; }
        
        const Words = CountWords(Text);
        StatusBarItem.text = `$(edit) ${Words} Word${Words === 1 ? '' : 's'} | ${Text.length} Char${Text.length === 1 ? '' : 's'}`;
    };

    // Initialize word count display
    SetWordCount();
    StatusBarItem.show();

    // Update count on document change or selection change
    vscode.workspace.onDidChangeTextDocument(SetWordCount);
    vscode.window.onDidChangeTextEditorSelection(SetWordCount);
}

export function deactivate() {}