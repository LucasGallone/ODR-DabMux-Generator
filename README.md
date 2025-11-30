# ODR-DabMux-Generator

## Overview

This is an HTML generator to easily create the configuration file of a DAB+
multiplex with all settings, including the services list, which can then be used by `odr-dabmux` from Opendigitalradio.

The purpose is to simplify the creation of the configuration file, to automate
the assignment of the ECC and LIC values ​​by choosing the country and language
of each of your services (Rather than looking for this information in the
official ETSI documents).

There is also a CUs calculator that runs in real-time and updates as you add
your services, in order to be certain not to exceed the max Capacity Units
value (864), and therefore to adapt the audio bitrate and the EEP protection
of the services on a case-by-case basis, in order to remain within the standard.

You can also import an existing configuration file in order to edit it. The
only disadvantage is that the ECC and LIC values will be ignored since it is
difficult to guess the exact country and language of the services just from
the values. Therefore, you will have to add them manually from the interface
before exporting your new configuration file.

Once you have generated and downloaded your configuration file with your
desired services list, place it in the config folder of ODR.

Your multiplex should be ready to run now!

<b><ins>You have 2 ways of running the generator:</b></ins>

1. Remotely, via GitHub:

[🢂 Click here to access the generator 🢀](https://lucasgallone.github.io/ODR-DabMux-Generator/)

2. Locally, via a container:

```bash
git clone https://github.com/lucasgallone/odr-dabmux-generator
cd odr-dabmux-generator
docker compose up --detach

# Then access http://localhost
```

## Fields that can be generated

| Field | Description |
| ----- | ----------- |
| Ensemble ID (EID) | Your multiplex identification code (4 characters max) |
| Ensemble Country (for ECC) | Automatically generates the ECC (Extended Country Code) for your ensemble, associated to the selected country in the list - Select the country your multiplex is broadcasting from |
| Long Ensemble Label | The name of your multiplex that will be displayed on receivers (16 characters max) |
| Short Ensemble Label | Same purpose as the previous field, but shorter (8 characters max), for the receivers with a limited display |
| SID (Serivce ID) | The identification code of your radio service, equivalent to the PI code function on FM (4 characters max) |
| Long Label | The name of your radio service that will be displayed on receivers (16 characters max) |
| Short Label | Same purpose as the previous field, but shorter (8 characters max), for the receivers with a limited display |
| PTY (Program Type) | A function that allows to know the program style broadcast by your radio service (e.g. Pop Music, Rock Music, News) |
| DAB Type | Must be modified only if you want to use Standard DAB (Still active in the UK) - The default value is to create a DAB+ service |
| Bitrate | The audio quality of your radio service, from 8 to 384 Kbps - The real-time CUs calculator might help you set the correct value |
| EEP (Equal Error Protection) | The lower the value is (1A), the easiest your radio service will be decoded by receivers with a weak signal, but it will increase the CUs usage in comparison to an higher value (2A, 3A or 4A) - The real-time CUs calculator might help you set the correct value |
| Country (for ECC) | Automatically generates the ECC (Extended Country Code) for your radio service, associated to the selected country in the list - Select the country the radio station is broadcasting from |
| Language (for LIC) | Automatically generates the LIC (Language Identification Code) for your radio service, associated to the selected language in the list - Select the language used by the radio station |
| Port | The port that will be used for the "inputuri" value of your radio service - Leave the default value unless you really want to use a customized one |

When clicking on the "Generate and download the odr-dabmux.info file" button, you will be prompted to edit the ```managementport```, ```telnetport```, ```zmqendpoint``` and ```listenport``` values. If you're okay to use the default values (which are pre-filled), just ignore this step and click on the "Generate and download the file now" to export your configuration.

## Original developers

The original developers of ODR-DabMux are Matthias P. Braendli and
Pascal Charest. Without their work, none of this would be possible.

You can find all credits on the
[original page of ODR-DabMux](https://github.com/Opendigitalradio/ODR-DabMux).
