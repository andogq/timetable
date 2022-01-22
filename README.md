# Timetable Generator

A little web app to make choosing a timetable simple.

It is still in a very early stage, so there is a lot that is to be improved in
both looks and functionality, so please feel free to contribute either ideas or
code, anything is appreciated!

## Institution Support

This generator is built for the Allocate+ timetable software, and will not work
for other platforms. It is currently not a focus to bring this to other
platforms, how ever if your institution does use something else please do open
an issue with your institution name and the name of platform that they use, for
future consideration.

Currently, the following institutions have been verified to work:

 - RMIT University
 - Melbourne University

Does your institution use Allocate+ and isn't in the list above? Please open an
issue so it can be added.

## Features:

 - [ ] Generation optimisations
    
    - [x] Optimise for minimal days
    
    - [x] Optimise for minimal breaks between subjects
    
    - [x] Optimise to attend a specific campus (including online/in-person)
    
    - [ ] Optimise to group days (eg have all classes at the start/middle/end of
    the week)
    
    - [ ] Optimise for specific times in the day (all classes in morning,
    afternoon ect)
    
    - [ ] Optimise around prior commitments (block out days/times)
    
 - [ ] Generate a timetable with a friend to both be in the same classes
 
 - [ ] Generate best options for allocation adjustment, based on how full
 classes are
 
 - [ ] Show alternatives for a class, to further customise the generated
 timetable

## How does it work?

All processing occurs on device, and no timetable data is stored on any servers
anywhere.

The data is collected through a bookmarklet, which is a little snippet of
JavaScript that is stored within a bookmark in the browser, and can only be
executed manually by the user. This bookmarklet injects a script into the
timetable page, which makes requests to the timetable server to download the
data for each class.

Once the data is collected, it is encoded and sent to the web app in the URL,
where it is collected and processed.

### Why a bookmarklet, why not an extension?

Extensions needlessly add complexity to what is trying to be achieved. They
require submission to an extension store for each browser, have differing APIs
between browsers and are not quite what is required.

A bookmarklet works on any browser that supports JS, is simple to create, update
and to distribute to users.

## Something's not right

If something isn't working as expected please create an
[issue](https://github.com/andogq/timetable/issues/new/choose) and describe what
the problem is that you're facing.

Did the app crash? Is there a better combination that you can make yourself? Is
there an optimisation or feature that is missing that you would like to see
added? Whatever it is, please don't hesistate to make an issue.
