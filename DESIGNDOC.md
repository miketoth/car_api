# Design Doc

## What I would like to add

* Tests
  * Assert that data flow order is preverved
    * ie. the resetBelow function works as intended
  * Assert that prices are calculated correctly
    * Correct rounding
  * Form validation
    * make sure to check for 5 and 9 digit zip
    * check that miles is entered without a comma (or correct for comma)
* A better user interface/ux direction
  * ie. what problem is this trying to solve? Is it comparison of maintenance schedules or a look up of a specific maintenance schedule
  * Background img/color, centering, font size and type changes, spacing
* Error Messages
  * Both correct styling and message
  * Also error logging for application monitoring and application errors
* Form validation (addressed in tests)
* Add more years & make years dynamic so it can be adjusted based on data set
* Remove models where maintenance data does not exist
* Adjusting maintenance schedule with more granularity
  * currently only supports 5 major tiers
    * 0-25
    * 25-50
    * 50-75
    * 75-100
    * >100
* Consolidate code
  * Some of the event handling code can be abstracted into helper functions so maintenance of the web page is easier along with adding new drop-downs (ie. battery)
* Refactor callbacks to use promises instead
  * cleaner and more readable than current iteration
