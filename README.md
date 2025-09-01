# ODR-DabMux-Generator
[Click here to access the generator.](https://lucasgallone.github.io/ODR-DabMux-Generator/)


This is an HTML generator to easily create the configuration file of a DAB+ multiplex with all settings, including the services list, which can then run with the tools of Opendigitalradio.

The purpose is to simplify the creation of the configuration file, to automate the assignment of the ECC and LIC values ​​by choosing the country and language of each of your services (Rather than looking for this information in the official ETSI documents).

There is also a CUs calculator that runs in real-time and updates as you add your services, in order to be certain not to exceed the max Capacity Units value (864), and therefore to adapt the audio bitrate and the EEP protection of the services on a case-by-case basis, in order to remain within the standard.

Once you have generated and downloaded your configuration file with your desired services list, place it in the config folder of ODR.
<br>
Your multiplex should be ready to run now!
