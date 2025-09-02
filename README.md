# ODR-DabMux-Generator
[Click here to access the generator.](https://lucasgallone.github.io/ODR-DabMux-Generator/)


This is an HTML generator to easily create the configuration file of a DAB+ multiplex with all settings, including the services list, which can then run with the tools of Opendigitalradio.

The purpose is to simplify the creation of the configuration file, to automate the assignment of the ECC and LIC values ​​by choosing the country and language of each of your services (Rather than looking for this information in the official ETSI documents).

There is also a CUs calculator that runs in real-time and updates as you add your services, in order to be certain not to exceed the max Capacity Units value (864), and therefore to adapt the audio bitrate and the EEP protection of the services on a case-by-case basis, in order to remain within the standard.

Once you have generated and downloaded your configuration file with your desired services list, place it in the config folder of ODR.
<br>
Your multiplex should be ready to run now!

# Fields that can be generated

• ```Ensemble ID (EID)``` - Your multiplex identification code (4 characters max).


• ```Ensemble Country (for ECC)``` - Automatically generates the ECC (Extended Country Code) for your ensemble, associated to the selected country in the list. Select the country your multiplex is broadcasting from.


• ```Long Ensemble Label``` - The name of your multiplex that will be displayed on receivers (16 characters max).


• ```Short Ensemble Label``` - Same purpose as the previous field, but shorter (8 characters max), for the receivers with a limited display.


• ```SID (Serivce ID)``` - The identification code of your radio service, equivalent to the PI code function on FM (4 characters max).


• ```Long Label``` - The name of your radio service that will be displayed on receivers (16 characters max).


• ```Short Label``` - Same purpose as the previous field, but shorter (8 characters max), for the receivers with a limited display.


• ```PTY (Program Type)``` - A function that allows to know the program style broadcast by your radio service (e.g. Pop Music, Rock Music, News).


• ```DAB Type``` - Must be modified only if you want to use Standard DAB (Still active in the UK), the default value is to create a DAB+ service.


• ```Bitrate``` - The audio quality of your radio service, from 8 to 384 Kbps. The real-time CUs calculator might help you set the correct value.


• ```EEP``` - (Equal Error Protection) - The lower the value is (1A), the easiest your radio service will be decoded by receivers with a weak signal, but it will increase the CUs usage in comparison to an higher value (2A, 3A or 4A). The real-time CUs calculator might help you set the correct value.


• ```Country (for ECC)``` - Automatically generates the ECC (Extended Country Code) for your radio service, associated to the selected country in the list. Select the country the radio station is broadcasting from.


• ```Language (for LIC)``` - Automatically generates the LIC (Language Identification Code) for your radio service, associated to the selected language in the list. Select the language used by the radio station.


• ```Port``` - The port that will be used for the "inputuri" value of your radio service. Leave the default value unless you really know what you're doing.

# An example...

![example](https://github.com/user-attachments/assets/b5b1483b-cddd-4fef-b30c-4cdfaf2599b5)
