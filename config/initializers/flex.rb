# see the detailed Configuration documentation at https://github.com/ddnexus/flex/wiki/Configuration

Flex::Configuration.configure do |config|

  # you MUST add your indexed model names here
  config.flex_models = %w[ Item ]

  # Add the your result extenders here
  config.result_extenders |= [ FlexSearchExtender ]

  # Add the default variables here
  # see also the details Variables documentation at https://github.com/ddnexus/flex/wiki/Variables
  # config.variables.add :index => 'my_index',
  #                      :type  => 'project',
  #                      :anything => 'anything

  # The custom url of your ElasticSearch server
  # config.base_uri = 'http://localhost:9200'

  # Set it to true to log the debug infos (true by default in development mode)
  # config.debug = false

  # Debug info are actually valid curl commands
  # config.debug_to_curl = false

  # The custom logger you want Flex to use. Default Rails.logger
  # config.logger = Logger.new(STDERR)

  # Custom config file path
  # config.config_file = '/custom/path/to/flex.yml',

  # Custom flex dir path
  # config.flex_dir = '/custom/path/to/flex',

  # The custom http_client you may want to implement
  # config.http_client = 'Your::Client'

  # The options passed to the http_client. They are client specific.
  # config.http_client_options = {:timeout => 5}

  # Experimental: checks the response and return a boolean (should raise?)
  # config.raise_proc = proc{|response| response.status >= 400}

end
