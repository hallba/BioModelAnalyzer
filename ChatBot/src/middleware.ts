// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE

import * as builder from 'botbuilder'
import * as strings from './dialogs/strings'

/** 
 * Registers debug middleware for the given bot with the following functionality:
 * 
 * 1. Arbitrary dialogs can be started with the message syntax '!dialogId' while skipping
 *    any intent recognizers like LUIS. Parameters can be passed in JSON syntax,
 *    e.g. '!dialogId {"foo": "bar"}'.
 * 
 * 2. Any dialog can be cancelled with a message starting with 'cancel'.
 */
export function registerMiddleware (bot: builder.UniversalBot) {
    let debugDialogMiddleware: builder.IMiddlewareMap = {
        botbuilder: (session, next) => {
            let text = session.message.text

            let dialogIdRegEx = /^!\w+/

	    if (!text) { 
	    	next()
	    } else if (text.toLowerCase().indexOf('cancel') === 0) {
                session.send(strings.OK)
                session.cancelDialog(0)
            } else if (dialogIdRegEx.test(text)) {
                let firstWhitespaceIdx = text.indexOf(' ')
                let args
                if (firstWhitespaceIdx !== -1) {
                    let argsStr = text.substr(firstWhitespaceIdx + 1)
                    try {
                        args = JSON.parse(argsStr)
                    } catch (e) {
                        console.log('Error parsing as JSON, fall-back to string argument: ' + argsStr)
                        args = argsStr
                    }
                }
                let dialogId = '/' + dialogIdRegEx.exec(text)[0].substr(1)
                session.beginDialog(dialogId, args)
            } else {
                next()
            }
        }
    }

    bot.use(debugDialogMiddleware)
}
