import boto3
from datetime import datetime, timedelta, timezone
from dateutil.parser import parse

ec2 = boto3.resource("ec2")


''' Clean Old EBS Volumes '''

vol_status = {"Name": "status", "Values": ["available"]}

for vol in ec2.volumes.filter(Filters=[vol_status]):
    vol_id = vol.id
    volume = ec2.Volume(vol.id)
    print("Cleanup EBS volume: ", vol_id)
    volume.delete()


# Clean Old AMIs

current_date = datetime.now()

client = boto3.client("ec2")

my_ami = client.describe_images(Owners=['self'])['Images']

for ami in my_ami:
    creation_date = ami['CreationDate']
    creation_date_parse = parse(creation_date).replace(tzinfo=None)
    ami_id = ami['ImageId']
    diff_in_days = (current_date - creation_date_parse).days
    print("Cleaning up all the AMI greater then 2 days old", ami_id)
    if diff_in_days > 2:
        client.deregister_image(ImageId=ami_id)


# Snapshots Cleanup

current_date = datetime.now(tz=timezone.utc)
diff_date = current_date - timedelta(days=10)


snapshots = ec2.snapshots.filter(OwnerIds=['self'])
for snapshot in snapshots:
    snapshot_start_time = snapshot.start_time
    if diff_date > snapshot_start_time:
        try:
            snapshot.delete()
            print("Deleting Snapshot id: ", snapshot.snapshot_id)

        except Exception as e:
            print("Current Snapshot is in use: ", snapshot.snapshot_id)
            continue
        
        
        

