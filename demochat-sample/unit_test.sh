echo "running unit test..."

npm test

export UNIT_COV=80%
export UNIT=true
echo UNIT_COV=$UNIT_COV
echo UNIT=$UNIT
echo UNIT_COV=$UNIT_COV >> $CF_VOLUME_PATH/env_vars_to_export
echo UNIT=$UNIT >> $CF_VOLUME_PATH/env_vars_to_export

