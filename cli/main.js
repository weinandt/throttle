yargs = require('yargs/yargs')(process.argv.slice(2))


yargs.command('get', 'descriptoin for get', (yargs) =>{
    yargs.positional('source', {
        describe: 'URL to fetch content from',
        type: 'string',
        default: 'http://www.google.com'
      })
}, (argv) => {
    console.log('In get')
})

yargs.command('set', 'descriptoin for set', () =>{}, (argv) => {
    console.log('In set')
})

yargs.version(false)
yargs.parse()