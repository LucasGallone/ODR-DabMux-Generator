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
You can also check if your services meet the ETSI requirements in real-time.

There is the possibility to import an existing configuration file in order to edit it.
Once you have generated and downloaded your configuration file with your
desired services list, place it in the config folder of ODR.

Follow the instructions on the interface and have fun creating your own multiplex!

## Ways to run the generator

<b>You have 2 ways of running the generator:</b>

1. Remotely, via GitHub:

[🢂 Click here to access the generator 🢀](https://lucasgallone.github.io/ODR-DabMux-Generator/)

2. Locally, via a container:

```bash
git clone https://github.com/lucasgallone/odr-dabmux-generator
cd odr-dabmux-generator
docker compose up --detach

# Then access http://localhost
```

## Original developers

The original developers of ODR-DabMux are Matthias P. Braendli and
Pascal Charest. Without their work, none of this would be possible.

You can find all credits on the
[original page of ODR-DabMux](https://github.com/Opendigitalradio/ODR-DabMux).
